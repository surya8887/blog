import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Clock, MessageSquare, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const FEATURED_POSTS = [
  {
    id: 1,
    title: "The Future of Web Development in 2026",
    excerpt: "Exploring the rise of agentic coding, AI-driven architectures, and the evolution of frontend frameworks.",
    author: { name: "Sarah Drasner", avatar: "https://i.pravatar.cc/150?u=sarah" },
    date: "May 24, 2026",
    readTime: "5 min read",
    category: "Technology",
    likes: 342,
    comments: 56,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: 2,
    title: "Building Resilient Microservices",
    excerpt: "A comprehensive guide to designing, deploying, and maintaining microservices at scale using Kubernetes.",
    author: { name: "Kelsey Hightower", avatar: "https://i.pravatar.cc/150?u=kelsey" },
    date: "May 22, 2026",
    readTime: "8 min read",
    category: "Architecture",
    likes: 892,
    comments: 124,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: 3,
    title: "Mastering Tailwind CSS v4",
    excerpt: "Discover the new features and performance improvements in the latest version of Tailwind CSS.",
    author: { name: "Adam Wathan", avatar: "https://i.pravatar.cc/150?u=adam" },
    date: "May 20, 2026",
    readTime: "4 min read",
    category: "Design",
    likes: 561,
    comments: 89,
    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=1000",
  }
]

export function FeaturedPosts() {
  return (
    <section className="py-16 container px-4 md:px-6 mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Featured Posts</h2>
        <Link to="/blogs" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURED_POSTS.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="h-full overflow-hidden border-0 shadow-lg dark:bg-zinc-900/50 hover:shadow-xl transition-all duration-300 group cursor-pointer bg-background">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-md">
                    {post.category}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6 flex flex-col h-[calc(100%-12rem)]">
                <div className="flex items-center text-xs text-muted-foreground mb-4 space-x-4">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {post.readTime}
                  </div>
                  <span>{post.date}</span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{post.author.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <div className="flex items-center text-xs hover:text-primary transition-colors">
                      <Heart className="mr-1 h-3 w-3" />
                      {post.likes}
                    </div>
                    <div className="flex items-center text-xs hover:text-primary transition-colors">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {post.comments}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
