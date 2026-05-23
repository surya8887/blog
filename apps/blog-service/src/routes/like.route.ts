import { Router } from "express";
import { protect } from "@blog/common";
import { validate } from "../middlewares/validate.middleware.js";
import {
    toggleLikeSchema,
    getPostLikesSchema
} from "../validation/like.validation.js";
import {
    toggleLike,
    getPostLikes
} from "../controllers/like.controller.js";

const router = Router();

router.route("/toggle/:postId")
    .post(protect, validate(toggleLikeSchema), toggleLike);

router.route("/post/:postId")
    .get(validate(getPostLikesSchema), getPostLikes);

export default router;
