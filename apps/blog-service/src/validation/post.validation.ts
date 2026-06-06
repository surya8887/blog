import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createPostSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").trim(),
        slug: z.string().trim().toLowerCase().optional(),
        content: z.string().min(1, "Content is required"),
        excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
    })
});

export const updatePostSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdPattern, "Invalid Object ID"),
    }),
    body: z.object({
        title: z.string().min(1).max(200).trim().optional(),
        slug: z.string().min(1).trim().toLowerCase().optional(),
        content: z.string().min(1).optional(),
        excerpt: z.string().max(500).optional(),
        coverImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update"
    })
});

export const deletePostSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdPattern, "Invalid Object ID"),
    })
});

export const getSinglePostSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdPattern, "Invalid Object ID"),
    })
});

export const getAllPostsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
        search: z.string().optional(),
        category: z.string().regex(objectIdPattern, "Invalid Object ID").optional(),
        sortBy: z.enum(["latest", "most viewed", "most liked"]).optional(),
        sortType: z.enum(["asc", "desc"]).optional(),
    })
});
