import z from "zod";
import { config } from "dotenv";
config()


const envSchema = z.object({
    DATABASE_URL : z.string().min(1),
    PORT : z.coerce.number().default(5000),
    ACCESS_TOKEN : z.string().min(1),
    ACCESS_TOKEN_EXPIRY : z.string().min(1),
    REFRESH_TOKEN : z.string().min(1),
    REFRESH_TOKEN_EXPIRY : z.string().min(1),
    JWT_SECRET : z.string().min(1),
    FIREBASE_SERVICE_ACCOUNT : z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
