import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@blog/common";
import {
    signupService,
    loginService,
    logoutService
} from "../services/auth.service.js";

export const signup = asyncHandler(async (req: Request, res: Response) => {
    const user = await signupService(req.body);
    res.status(201).json(new ApiResponse(201, user, "User created successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await loginService(req.body);
    res.status(200).json(new ApiResponse(200, result, "Logged in successfully"));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    // Requires authentication to logout
    await logoutService(req.user.id);
    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});
