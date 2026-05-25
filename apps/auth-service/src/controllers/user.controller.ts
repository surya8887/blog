import type { Request, Response, NextFunction } from "express";
import { getAllUsersService, updateUserService } from "../services/user.service.js";
import { asyncHandler } from "@blog/common";

export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const users = await getAllUsersService(req.query);
    res.status(200).json({
        success: true,
        data: users,
        message: "Users fetched successfully"
    });
});

export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const updatedUser = await updateUserService(id, req.body);
    res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User updated successfully"
    });
});
