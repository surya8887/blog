import { Router } from "express";
import { protect, restrictTo } from "@blog/common";
import { validate } from "../middleware/validate.middleware.js";
import { getAllUsersSchema, updateUserSchema } from "../validation/user.validation.js";
import { getAllUsers, updateUser } from "../controllers/user.controller.js";
import { cacheMiddleware } from "@blog/redis-client";

const router = Router();

// Only superadmin can manage users
router.use(protect);
router.use(restrictTo("SUPERADMIN"));

router.route("/admin/all")
    .get(cacheMiddleware(300), validate(getAllUsersSchema), getAllUsers);

router.route("/admin/:id")
    .put(validate(updateUserSchema), updateUser);

export default router;
