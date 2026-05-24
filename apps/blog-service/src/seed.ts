import mongoose from "mongoose";
import { env } from "./config/env.js";
import { Category } from "./models/category.model.js";
import { Post } from "./models/post.model.js";

const dummyCategories = [
    { name: "Technology", slug: "technology" },
    { name: "React", slug: "react" },
    { name: "Design", slug: "design" },
    { name: "Architecture", slug: "architecture" },
    { name: "CSS", slug: "css" },
];

const dummyPosts = [
    {
        title: "The Future of Web Development in 2026",
        slug: "the-future-of-web-development-in-2026",
        content: "Exploring the rise of agentic coding, AI-driven architectures, and the evolution of frontend frameworks. The landscape of web development is shifting rapidly as AI tools become deeply integrated into the developer workflow.",
        excerpt: "Exploring the rise of agentic coding, AI-driven architectures, and the evolution of frontend frameworks.",
        coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000",
        categoryName: "Technology",
        author: {
            userId: new mongoose.Types.ObjectId(),
            name: "Sarah Drasner",
            avatar: "https://i.pravatar.cc/150?u=sarah"
        },
        status: "published",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        likeCount: 342,
        commentCount: 56,
        viewCount: 1024
    },
    {
        title: "Building Resilient Microservices",
        slug: "building-resilient-microservices",
        content: "A comprehensive guide to designing, deploying, and maintaining microservices at scale using Kubernetes. We will cover event-driven architectures, circuit breakers, and distributed tracing.",
        excerpt: "A comprehensive guide to designing, deploying, and maintaining microservices at scale using Kubernetes.",
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
        categoryName: "Architecture",
        author: {
            userId: new mongoose.Types.ObjectId(),
            name: "Kelsey Hightower",
            avatar: "https://i.pravatar.cc/150?u=kelsey"
        },
        status: "published",
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        likeCount: 892,
        commentCount: 124,
        viewCount: 4500
    },
    {
        title: "Mastering Tailwind CSS v4",
        slug: "mastering-tailwind-css-v4",
        content: "Discover the new features and performance improvements in the latest version of Tailwind CSS. Tailwind v4 brings a rewritten engine, zero configuration, and native CSS variables support.",
        excerpt: "Discover the new features and performance improvements in the latest version of Tailwind CSS.",
        coverImage: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=1000",
        categoryName: "Design",
        author: {
            userId: new mongoose.Types.ObjectId(),
            name: "Adam Wathan",
            avatar: "https://i.pravatar.cc/150?u=adam"
        },
        status: "published",
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        likeCount: 561,
        commentCount: 89,
        viewCount: 2300
    },
    {
        title: "Understanding React Server Components",
        slug: "understanding-react-server-components",
        content: "A deep dive into how Server Components can drastically improve your application's performance and SEO by pushing rendering to the edge.",
        excerpt: "A deep dive into how Server Components can drastically improve your application's performance and SEO.",
        coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
        categoryName: "React",
        author: {
            userId: new mongoose.Types.ObjectId(),
            name: "Dan Abramov",
            avatar: "https://i.pravatar.cc/150?u=dan"
        },
        status: "published",
        publishedAt: new Date(),
        likeCount: 1200,
        commentCount: 400,
        viewCount: 8000
    }
];

const seedDatabase = async () => {
    try {
        if (!env.MONGO_URI) throw new Error("MONGO_URI missing");
        
        const uri = env.MONGO_URI.endsWith('/') ? `${env.MONGO_URI}blogs` : `${env.MONGO_URI}/blogs`;
        await mongoose.connect(uri);
        console.log("✅ Database connected for seeding");

        // Clear existing data
        await Category.deleteMany({});
        await Post.deleteMany({});
        console.log("🗑️  Cleared existing collections");

        // Insert Categories
        const createdCategories = await Category.insertMany(dummyCategories);
        console.log("✅ Categories seeded");

        // Map category names to their new ObjectIds
        const categoryMap = createdCategories.reduce((acc, cat) => {
            acc[cat.name] = cat._id;
            return acc;
        }, {} as Record<string, mongoose.Types.ObjectId>);

        // Prepare and insert Posts
        const postsToInsert = dummyPosts.map(post => {
            const { categoryName, ...rest } = post;
            return {
                ...rest,
                category: categoryMap[categoryName] || categoryMap["Technology"], // Fallback
            };
        });

        await Post.insertMany(postsToInsert);
        console.log("✅ Posts seeded");

        console.log("🎉 Database seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();
