import { Router } from "express";
import { protect } from "@blog/common";
import { validate } from "../middlewares/validate.middleware.js";
import {
    addCommentSchema,
    updateCommentSchema,
    deleteCommentSchema,
    getCommentsByPostSchema
} from "../validation/comment.validation.js";
import {
    addComment,
    updateComment,
    deleteComment,
    getCommentsByPost
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/")
    .post(protect, validate(addCommentSchema), addComment);

router.route("/:id")
    .put(protect, validate(updateCommentSchema), updateComment)
    .delete(protect, validate(deleteCommentSchema), deleteComment);

router.route("/post/:postId")
    .get(validate(getCommentsByPostSchema), getCommentsByPost);

export default router;
