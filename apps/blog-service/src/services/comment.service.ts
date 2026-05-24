import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "@blog/common";
import { aggregatePaginate } from "../utils/pagination.js";
import { Types } from "mongoose";
import type { PipelineStage } from "mongoose";

export const addCommentService = async (data: any, user: any) => {
    const { content, postId, parentCommentId } = data;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError("Post not found", 404);
    }

    if (parentCommentId) {
        const parent = await Comment.findById(parentCommentId);
        if (!parent) {
            throw new ApiError("Parent comment not found", 404);
        }
    }

    const comment = await Comment.create({
        content,
        post: postId,
        parentComment: parentCommentId || undefined,
        author: {
            userId: user.id,
            name: user.name,
            avatar: user.avatar || "",
        }
    });

    // Increment comment count on post
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    return comment;
};

export const updateCommentService = async (id: string, content: string, userId: string) => {
    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError("Comment not found", 404);
    }

    if (comment.author.userId.toString() !== userId) {
        throw new ApiError("You do not have permission to update this comment", 403);
    }

    if (comment.isDeleted) {
        throw new ApiError("Cannot update a deleted comment", 400);
    }

    comment.content = content;
    await comment.save();

    return comment;
};

export const deleteCommentService = async (id: string, userId: string, role: string) => {
    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError("Comment not found", 404);
    }

    if (comment.author.userId.toString() !== userId && role !== "admin") {
        throw new ApiError("You do not have permission to delete this comment", 403);
    }

    if (!comment.isDeleted) {
        comment.isDeleted = true;
        comment.deletedAt = new Date();
        await comment.save();

        // Decrement comment count on post
        await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
    }
};

export const getCommentsByPostService = async (postId: string, query: any) => {
    const { page = 1, limit = 10 } = query;

    const pipeline: PipelineStage[] = [
        { 
            $match: { 
                post: new Types.ObjectId(postId as string),
                isDeleted: false,
                parentComment: null
            } 
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "parentComment",
                as: "replies"
            }
        },
        // Filter out deleted replies
        {
            $addFields: {
                replies: {
                    $filter: {
                        input: "$replies",
                        as: "reply",
                        cond: { $eq: ["$$reply.isDeleted", false] }
                    }
                }
            }
        },
        { $sort: { createdAt: -1 } }
    ];

    return await aggregatePaginate(Comment, pipeline, {
        page: Number(page),
        limit: Number(limit)
    });
};

export const adminGetAllCommentsService = async (query: any) => {
    const { page = 1, limit = 20, search } = query;

    const pipeline: PipelineStage[] = [
        { $match: { isDeleted: false } },
        {
            $lookup: {
                from: "posts",
                localField: "post",
                foreignField: "_id",
                as: "postDetails"
            }
        },
        {
            $unwind: { path: "$postDetails", preserveNullAndEmptyArrays: true }
        },
    ];

    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { content: { $regex: search, $options: "i" } },
                    { "postDetails.title": { $regex: search, $options: "i" } },
                    { "author.name": { $regex: search, $options: "i" } },
                ]
            }
        });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    return await aggregatePaginate(Comment, pipeline, {
        page: Number(page),
        limit: Number(limit)
    });
};

