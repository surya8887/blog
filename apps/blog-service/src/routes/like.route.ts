import { Router } from "express";
import { protect } from "@blog/common";
import { validate } from "../middlewares/validate.middleware.js";
import {
    toggleLikeSchema,
    getPostLikesSchema
} from "../validation/like.validation.js";
import {
    toggleLike,
    getPostLikes,
    getLikeStatus
} from "../controllers/like.controller.js";

const router = Router();

router.route("/toggle/:postId")
    .post(protect, validate(toggleLikeSchema), toggleLike);

// GET /likes/status/:postId — check if the current user has liked this post
router.route("/status/:postId")
    .get(protect, validate(toggleLikeSchema), getLikeStatus);

router.route("/post/:postId")
    .get(validate(getPostLikesSchema), getPostLikes);

export default router;
