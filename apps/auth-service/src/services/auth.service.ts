import { PrismaClient } from "../generated/prisma/index.js";
import { ApiError } from "@blog/common";
import jwt from "jsonwebtoken";
// Note: In a real project, use bcrypt or argon2. For now we will mock it or use a simple base64 to avoid adding dependencies, or use the node built-in crypto. Let's assume standard crypto is fine.
import crypto from "crypto";
import { env } from "../config/env.js";

const prisma = new PrismaClient();

const hashPassword = (password: string): string => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

export const signupService = async (data: any) => {
    const { email, password, firstName, lastName } = data;

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new ApiError("Email already in use", 400);
    }

    const hashedPassword = hashPassword(password);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email,
                password: hashedPassword,
                profile: {
                    create: {
                        firstName,
                        lastName
                    }
                }
            },
            include: {
                profile: true
            }
        });

        return newUser;
    });

    const { password: _, refreshToken: __, ...userWithoutSensitiveInfo } = user;
    return userWithoutSensitiveInfo;
};

export const loginService = async (data: any) => {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true }
    });

    if (!user || user.password !== hashPassword(password)) {
        throw new ApiError("Invalid email or password", 401);
    }

    if (!user.isActive) {
        throw new ApiError("User account is deactivated", 403);
    }

    // Generate tokens
    const accessToken = jwt.sign(
        { id: user.id, role: user.role, name: `${user.profile?.firstName} ${user.profile?.lastName}`, avatar: user.profile?.profilePicture },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        env.JWT_SECRET,
        { expiresIn: "7d" } // Refresh tokens are typically longer lived
    );

    // Save refresh token to user
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });

    const { password: _, refreshToken: __, ...userWithoutSensitiveInfo } = user;
    
    return {
        user: userWithoutSensitiveInfo,
        accessToken,
        refreshToken
    };
};

export const logoutService = async (userId: string) => {
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }
    });
};
