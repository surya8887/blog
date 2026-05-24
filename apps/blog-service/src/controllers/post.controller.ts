import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@blog/common";
import {
    createPostService,
    updatePostService,
    deletePostService,
    getSinglePostService,
    getAllPostsService,
    getMyPostsService,
    adminGetAllPostsService
} from "../services/post.service.js";

export const createPost = asyncHandler(async (req: Request, res: Response) => {
    const post = await createPostService(req.body, req.user);
    res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
    const post = await updatePostService(req.params.id as string, req.body, req.user.id);
    res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    await deletePostService(req.params.id as string, req.user.id, req.user.role);
    res.status(200).json(new ApiResponse(200, null, "Post deleted successfully"));
});

export const getSinglePost = asyncHandler(async (req: Request, res: Response) => {
    const post = await getSinglePostService(req.params.id as string);
    res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));
});

export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
    const result = await getAllPostsService(req.query);
    res.status(200).json(new ApiResponse(200, result, "Posts fetched successfully"));
});

export const getMyPosts = asyncHandler(async (req: Request, res: Response) => {
    const result = await getMyPostsService(req.user.id, req.query);
    res.status(200).json(new ApiResponse(200, result, "Your posts fetched successfully"));
});

export const adminGetAllPosts = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminGetAllPostsService(req.query);
    res.status(200).json(new ApiResponse(200, result, "All posts fetched (admin)"));
});
