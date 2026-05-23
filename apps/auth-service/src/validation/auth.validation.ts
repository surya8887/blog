import { z } from "zod";

const signupValidation = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const signinValidation = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export {signupValidation,signinValidation};