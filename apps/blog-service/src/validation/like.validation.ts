import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const toggleLikeSchema = z.object({
    params: z.object({
        postId: z.string().regex(objectIdPattern, "Invalid Post ID"),
    })
});

export const getPostLikesSchema = z.object({
    params: z.object({
        postId: z.string().regex(objectIdPattern, "Invalid Post ID"),
    }),
    query: z.object({
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
    })
});
