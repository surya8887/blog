import { Router } from "express";
import { protect, restrictTo } from "@blog/common";
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
    getCommentsByPost,
    adminGetAllComments
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/")
    .post(protect, validate(addCommentSchema), addComment);

router.route("/:id")
    .put(protect, validate(updateCommentSchema), updateComment)
    .delete(protect, validate(deleteCommentSchema), deleteComment);

router.route("/post/:postId")
    .get(validate(getCommentsByPostSchema), getCommentsByPost);

// GET /api/v1/comments/admin/all — admin only: all comments with post info
router.route("/admin/all")
    .get(protect, restrictTo("admin"), adminGetAllComments);

export default router;
