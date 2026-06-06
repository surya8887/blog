import { z } from "zod";

export const updateProfileSchema = z.object({
    body: z.object({
        firstName: z.string().min(1).trim().optional(),
        lastName: z.string().min(1).trim().optional(),
        bio: z.string().max(500).optional(),
        profilePicture: z.string().url().optional(),
        coverPicture: z.string().url().optional(),
        phone: z.string().optional(),
        birthDate: z.string().datetime().optional(), // Expects ISO 8601 string
        gender: z.string().optional(),
        address: z.string().optional(),
        socialLinks: z.record(z.string(), z.string().url()).optional(), // Expects a JSON object with string URLs
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided to update"
    })
});
