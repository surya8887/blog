import { z } from "zod";

export const signupSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format").toLowerCase(),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        firstName: z.string().min(1, "First name is required").trim(),
        lastName: z.string().min(1, "Last name is required").trim(),
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format").toLowerCase(),
        password: z.string().min(1, "Password is required"),
    })
});

export const googleLoginSchema = z.object({
    body: z.object({
        idToken: z.string().min(1, "idToken is required"),
    })
});