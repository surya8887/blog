import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@blog/common";
import {getProfileService,updateProfileService} from "../services/profile.service.js";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const profile = await getProfileService(req.user.id);
    res.status(200).json(new ApiResponse(200, profile, "Profile fetched successfully"));
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    const profile = await updateProfileService(req.user.id, req.body);
    res.status(200).json(new ApiResponse(200, profile, "Profile updated successfully"));
});

import { uploadImageService } from "../services/profile.service.js";

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json(new ApiResponse(400, null, "No image file provided"));
        return;
    }
    const profile = await uploadImageService(req.user.id, "profilePicture", req.file.buffer);
    res.status(200).json(new ApiResponse(200, profile, "Avatar uploaded successfully"));
});

export const uploadCover = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json(new ApiResponse(400, null, "No image file provided"));
        return;
    }
    const profile = await uploadImageService(req.user.id, "coverPicture", req.file.buffer);
    res.status(200).json(new ApiResponse(200, profile, "Cover image uploaded successfully"));
});
