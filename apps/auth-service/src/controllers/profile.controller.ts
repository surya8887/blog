import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@blog/common";
import {
    getProfileService,
    updateProfileService
} from "../services/profile.service.js";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const profile = await getProfileService(req.user.id);
    res.status(200).json(new ApiResponse(200, profile, "Profile fetched successfully"));
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    const profile = await updateProfileService(req.user.id, req.body);
    res.status(200).json(new ApiResponse(200, profile, "Profile updated successfully"));
});
