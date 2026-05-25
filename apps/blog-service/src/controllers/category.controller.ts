import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@blog/common";
import { clearCache } from "@blog/redis-client";
import {
    createCategoryService,
    updateCategoryService,
    deleteCategoryService,
    getAllCategoriesService
} from "../services/category.service.js";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await createCategoryService(req.body);
    await clearCache("cache:/api/v1/categories*");
    res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await updateCategoryService(req.params.id as string, req.body);
    await clearCache("cache:/api/v1/categories*");
    res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    await deleteCategoryService(req.params.id as string);
    await clearCache("cache:/api/v1/categories*");
    res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
});

export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await getAllCategoriesService();
    res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});
