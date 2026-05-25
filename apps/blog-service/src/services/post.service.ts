import { Post } from "../models/post.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "@blog/common";
import { aggregatePaginate } from "../utils/pagination.js";
import { Types } from "mongoose";
import type { PipelineStage } from "mongoose";

export const createPostService = async (data: any, user: any) => {
    // Generate slug from title if not provided
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
        throw new ApiError("Post with this title/slug already exists", 400);
    }

    let categoryId = data.category;
    
    // If category is provided as a string (and not a valid ObjectId), try to find or create it
    if (data.category && !Types.ObjectId.isValid(data.category)) {
        let categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${data.category}$`, 'i') } });
        if (!categoryDoc) {
            // Auto-create category if it doesn't exist
            const catSlug = data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            categoryDoc = await Category.create({ name: data.category, slug: catSlug });
        }
        categoryId = categoryDoc._id;
    }

    return await Post.create({
        ...data,
        slug,
        category: categoryId,
        status: data.status || "draft",
        author: {
            userId: user.id,
            name: user.name,
            avatar: user.avatar || "",
        },
        ...(data.status === "published" && { publishedAt: new Date() }),
    });
};

export const updatePostService = async (id: string, data: any, userId: string) => {
    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError("Post not found", 404);
    }

    if (post.author.userId.toString() !== userId) {
        throw new ApiError("You do not have permission to update this post", 403);
    }

    const updatedData = { ...data };
    
    // Update slug if title changes
    if (updatedData.title && updatedData.title !== post.title && !updatedData.slug) {
        updatedData.slug = updatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Handle string categories
    if (updatedData.category && !Types.ObjectId.isValid(updatedData.category)) {
        let categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${updatedData.category}$`, 'i') } });
        if (!categoryDoc) {
            const catSlug = updatedData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            categoryDoc = await Category.create({ name: updatedData.category, slug: catSlug });
        }
        updatedData.category = categoryDoc._id;
    }

    if (updatedData.status === "published" && post.status !== "published") {
        updatedData.publishedAt = new Date();
    }

    return await Post.findByIdAndUpdate(id, updatedData, { returnDocument: 'after', runValidators: true });
};

export const deletePostService = async (id: string, userId: string, role: string) => {
    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError("Post not found", 404);
    }

    if (post.author.userId.toString() !== userId && role !== "admin") {
        throw new ApiError("You do not have permission to delete this post", 403);
    }

    await Post.findByIdAndDelete(id);
};

export const getSinglePostService = async (id: string) => {
    const post = await Post.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { returnDocument: 'after' }
    ).populate("category");

    if (!post) {
        throw new ApiError("Post not found", 404);
    }

    return post;
};

export const getAllPostsService = async (query: any) => {
    const { 
        page = 1, 
        limit = 10, 
        search, 
        category, 
        sortBy = "latest", 
        sortType = "desc" 
    } = query;

    const pipeline: PipelineStage[] = [];

    const matchStage: any = { status: "published" };

    if (search) {
        matchStage.$or = [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
        ];
    }

    if (category) {
        matchStage.category = new Types.ObjectId(category as string);
    }

    pipeline.push({ $match: matchStage });

    pipeline.push({
        $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails"
        }
    });

    pipeline.push({
        $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true
        }
    });

    let sortStage: any = {};
    const sortDirection = sortType === "asc" ? 1 : -1;

    switch (sortBy) {
        case "most viewed":
            sortStage = { viewCount: sortDirection };
            break;
        case "most liked":
            sortStage = { likeCount: sortDirection };
            break;
        case "latest":
        default:
            sortStage = { publishedAt: sortDirection };
            break;
    }

    pipeline.push({ $sort: sortStage });

    return await aggregatePaginate(Post, pipeline, {
        page: Number(page),
        limit: Number(limit)
    });
};

export const getMyPostsService = async (userId: string, query: any) => {
    const { page = 1, limit = 20, sortBy = "latest", sortType = "desc" } = query;

    const pipeline: PipelineStage[] = [
        { $match: { "author.userId": userId } },
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        {
            $unwind: {
                path: "$categoryDetails",
                preserveNullAndEmptyArrays: true
            }
        },
    ];

    const sortDirection = sortType === "asc" ? 1 : -1;
    let sortStage: any = {};
    switch (sortBy) {
        case "most viewed": sortStage = { viewCount: sortDirection }; break;
        case "most liked":  sortStage = { likeCount: sortDirection }; break;
        default:            sortStage = { createdAt: sortDirection }; break;
    }
    pipeline.push({ $sort: sortStage });

    return await aggregatePaginate(Post, pipeline, {
        page: Number(page),
        limit: Number(limit)
    });
};

export const adminGetAllPostsService = async (query: any) => {
    const { page = 1, limit = 20, search, sortBy = "latest", sortType = "desc" } = query;

    const pipeline: PipelineStage[] = [];

    const matchStage: any = {};
    if (search) {
        matchStage.$or = [
            { title: { $regex: search, $options: "i" } },
            { "author.name": { $regex: search, $options: "i" } },
        ];
    }
    if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });

    pipeline.push({
        $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails"
        }
    });
    pipeline.push({
        $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true }
    });

    const sortDirection = sortType === "asc" ? 1 : -1;
    let sortStage: any = {};
    switch (sortBy) {
        case "most viewed": sortStage = { viewCount: sortDirection }; break;
        case "most liked":  sortStage = { likeCount: sortDirection }; break;
        default:            sortStage = { createdAt: sortDirection }; break;
    }
    pipeline.push({ $sort: sortStage });

    return await aggregatePaginate(Post, pipeline, {
        page: Number(page),
        limit: Number(limit)
    });
};


