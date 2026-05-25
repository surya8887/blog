import { Category } from "../models/category.model.js";
import { ApiError } from "@blog/common";
import { Types } from "mongoose";

export const createCategoryService = async (data: { name: string; slug: string; parent?: string | null }) => {
    const { name, slug, parent } = data;

    const existingCategory = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existingCategory) {
        throw new ApiError("Category with this name or slug already exists", 400);
    }

    const categoryData: any = { name, slug };
    if (parent) {
        categoryData.parent = parent;
    }

    return await Category.create(categoryData);};

export const updateCategoryService = async (id: string, data: { name?: string; slug?: string; parent?: string | null }) => {
    const updateData: any = { ...data };
    if (data.parent === null) {
        updateData.$unset = { parent: 1 };
        delete updateData.parent;
    }

    const category = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!category) {
        throw new ApiError("Category not found", 404);
    }

    return category;
};

export const deleteCategoryService = async (id: string) => {
    const childrenCount = await Category.countDocuments({ parent: new Types.ObjectId(id) });
    if (childrenCount > 0) {
        throw new ApiError("Cannot delete category with child categories. Please delete them first.", 400);
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        throw new ApiError("Category not found", 404);
    }

    return category;
};

export const getAllCategoriesService = async () => {
    return await Category.aggregate([
        {
            $match: { parent: null }
        },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "parent",
                as: "children"
            }
        }
    ]);
};
