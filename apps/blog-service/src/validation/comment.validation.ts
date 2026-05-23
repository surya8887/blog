import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const addCommentSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Content is required").max(1000, "Comment is too long").trim(),
        postId: z.string().regex(objectIdPattern, "Invalid Post ID"),
        parentCommentId: z.string().regex(objectIdPattern, "Invalid Parent Comment ID").optional().nullable(),
    })
});

export const updateCommentSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdPattern, "Invalid Object ID"),
    }),
    body: z.object({
        content: z.string().min(1, "Content is required").max(1000, "Comment is too long").trim(),
    })
});

export const deleteCommentSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdPattern, "Invalid Object ID"),
    })
});

export const getCommentsByPostSchema = z.object({
    params: z.object({
        postId: z.string().regex(objectIdPattern, "Invalid Post ID"),
    }),
    query: z.object({
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
    })
});
