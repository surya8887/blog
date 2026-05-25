import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const getAllUsersSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional().transform(Number),
        limit: z.string().regex(/^\d+$/).optional().transform(Number),
        search: z.string().optional(),
    })
});

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdPattern, "Invalid UUID"),
    }),
    body: z.object({
        role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
        isActive: z.boolean().optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update"
    })
});
