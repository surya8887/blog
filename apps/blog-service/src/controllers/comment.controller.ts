import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@blog/common";
import {
    addCommentService,
    updateCommentService,
    deleteCommentService,
    getCommentsByPostService
} from "../services/comment.service.js";

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const comment = await addCommentService(req.body, req.user);
    res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"));
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
    const comment = await updateCommentService(req.params.id as string, req.body.content, req.user.id);
    res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    await deleteCommentService(req.params.id as string, req.user.id, req.user.role);
    res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export const getCommentsByPost = asyncHandler(async (req: Request, res: Response) => {
    const result = await getCommentsByPostService(req.params.postId as string, req.query);
    res.status(200).json(new ApiResponse(200, result, "Comments fetched successfully"));
});
