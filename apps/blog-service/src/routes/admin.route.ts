import { Router } from "express";
import { protect, restrictTo, asyncHandler, ApiResponse } from "@blog/common";
import type { Request, Response } from "express";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { Category } from "../models/category.model.js";

const router = Router();

// GET /api/v1/admin/stats — aggregate dashboard stats
router.get(
    "/stats",
    protect,
    restrictTo("admin"),
    asyncHandler(async (req: Request, res: Response) => {
        const [totalPosts, totalComments, totalCategories, uniqueAuthors] = await Promise.all([
            Post.countDocuments(),
            Comment.countDocuments({ isDeleted: false }),
            Category.countDocuments(),
            Post.distinct("author.userId").then((ids) => ids.length),
        ]);

        res.status(200).json(
            new ApiResponse(200, {
                totalPosts,
                totalComments,
                totalCategories,
                totalAuthors: uniqueAuthors,
            }, "Admin stats fetched")
        );
    })
);

export default router;
