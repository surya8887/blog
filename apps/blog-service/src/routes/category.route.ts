import { Router } from "express";
import { protect, restrictTo } from "@blog/common";
import { validate } from "../middlewares/validate.middleware.js";
import { createCategorySchema, updateCategorySchema, deleteCategorySchema } from "../validation/category.validation.js";
import {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategories
} from "../controllers/category.controller.js";

const router = Router();

router.route("/")
    .get(getAllCategories)
    .post(protect, restrictTo("admin"), validate(createCategorySchema), createCategory);

router.route("/:id")
    .put(protect, restrictTo("admin"), validate(updateCategorySchema), updateCategory)
    .delete(protect, restrictTo("admin"), validate(deleteCategorySchema), deleteCategory);

export default router;
