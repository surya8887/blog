import z from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("5001"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    MONGO_URI: z.string().nonempty("MONGO_URI is required"),
});

export const env = envSchema.parse(process.env);