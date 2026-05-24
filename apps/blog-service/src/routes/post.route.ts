import { Router } from "express";
import { protect } from "@blog/common";
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
    getMyPosts
} from "../controllers/post.controller.js";

const router = Router();

router.route("/")
    .get(validate(getAllPostsSchema), getAllPosts)
    .post(protect, validate(createPostSchema), createPost);

// GET /api/v1/posts/my-posts — returns all posts by the logged-in user
router.route("/my-posts")
    .get(protect, getMyPosts);

router.route("/:id")
    .get(validate(getSinglePostSchema), getSinglePost)
    .put(protect, validate(updatePostSchema), updatePost)
    .delete(protect, validate(deletePostSchema), deletePost);

export default router;
