import { PostLike } from "../models/likes.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "@blog/common";
import { aggregatePaginate } from "../utils/pagination.js";
import { Types } from "mongoose";
import type { PipelineStage } from "mongoose";

export const toggleLikeService = async (postId: string, user: any) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError("Post not found", 404);
    }

    const existingLike = await PostLike.findOne({
        "user.userId": user.id,
        post: postId as string
    });

    let isLiked = false;

    if (existingLike) {
        await PostLike.findByIdAndDelete(existingLike._id);
        await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
        isLiked = false;
    } else {
        await PostLike.create({
            user: {
                userId: user.id,
                name: user.name,
                avatar: user.avatar || "",
            },
            post: new Types.ObjectId(postId as string)
        });
        await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
        isLiked = true;
    }

    return isLiked;
};

export const getPostLikesService = async (postId: string, query: any) => {
    const { page = 1, limit = 10 } = query;

    const pipeline: PipelineStage[] = [
        { $match: { post: new Types.ObjectId(postId as string) } },
        { $sort: { createdAt: -1 } }
    ];

    return await aggregatePaginate(PostLike, pipeline, {
        page: Number(page),
        limit: Number(limit)
    });
};
