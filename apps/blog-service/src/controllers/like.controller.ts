import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@blog/common";
import {
    toggleLikeService,
    getPostLikesService,
    getLikeStatusService
} from "../services/like.service.js";

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
    const isLiked = await toggleLikeService(req.params.postId as string, req.user);
    res.status(200).json(new ApiResponse(200, { isLiked }, `Post ${isLiked ? 'liked' : 'unliked'} successfully`));
});

export const getLikeStatus = asyncHandler(async (req: Request, res: Response) => {
    const isLiked = await getLikeStatusService(req.params.postId as string, req.user.id);
    res.status(200).json(new ApiResponse(200, { isLiked }, "Like status fetched"));
});

export const getPostLikes = asyncHandler(async (req: Request, res: Response) => {
    const result = await getPostLikesService(req.params.postId as string, req.query);
    res.status(200).json(new ApiResponse(200, result, "Post likes fetched successfully"));
});
