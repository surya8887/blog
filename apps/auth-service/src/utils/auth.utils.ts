import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const hashPassword = (password: string): string => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

export const checkPassword = (password: string, hash: string): boolean => {
    return hashPassword(password) === hash;
};

export const generateAccessToken = (user: any): string => {
    return jwt.sign(
        { 
            id: user.id, 
            role: user.role, 
            name: `${user.profile?.firstName} ${user.profile?.lastName}`, 
            avatar: user.profile?.profilePicture 
        },
        env.JWT_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRY as any }
    );
};

export const generateRefreshToken = (user: any): string => {
    return jwt.sign(
        { id: user.id },
        env.JWT_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRY as any }
    );
};
