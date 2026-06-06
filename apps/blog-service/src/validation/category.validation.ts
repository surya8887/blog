import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").trim(),
        slug: z.string().min(1, "Slug is required").trim().toLowerCase(),
        parent: z.string().regex(objectIdPattern, "Invalid Object ID for parent").optional().nullable(),
    })
});

export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdPattern, "Invalid Object ID"),
    }),
    body: z.object({
        name: z.string().min(1, "Name is required").trim().optional(),
        slug: z.string().min(1, "Slug is required").trim().toLowerCase().optional(),
        parent: z.string().regex(objectIdPattern, "Invalid Object ID for parent").optional().nullable(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update"
    })
});

export const deleteCategorySchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdPattern, "Invalid Object ID"),
    })
});
