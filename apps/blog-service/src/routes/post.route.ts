import { Router } from "express";
import { protect, restrictTo } from "@blog/common";
import { validate } from "../middlewares/validate.middleware.js";
import { 
    createPostSchema, 
    updatePostSchema, 
    deletePostSchema,
    getSinglePostSchema,
    getAllPostsSchema
} from "../validation/post.validation.js";
import {
    createPost,
    updatePost,
    deletePost,
    getSinglePost,
    getAllPosts,
    getMyPosts,
    adminGetAllPosts
} from "../controllers/post.controller.js";

const router = Router();

router.route("/")
    .get(validate(getAllPostsSchema), getAllPosts)
    .post(protect, validate(createPostSchema), createPost);

// GET /api/v1/posts/my-posts — returns all posts by the logged-in user
router.route("/my-posts")
    .get(protect, getMyPosts);

// GET /api/v1/posts/admin/all — admin only: all posts regardless of status
router.route("/admin/all")
    .get(protect, restrictTo("admin"), adminGetAllPosts);

router.route("/:id")
    .get(validate(getSinglePostSchema), getSinglePost)
    .put(protect, validate(updatePostSchema), updatePost)
    .delete(protect, validate(deletePostSchema), deletePost);

export default router;
