import { prisma } from "../config/db.js";
import { ApiError } from "@blog/common";
import { 
    hashPassword, 
    checkPassword, 
    generateAccessToken, 
    generateRefreshToken 
} from "../utils/auth.utils.js";

// Removed manual instantiation of prisma

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
    const user = await prisma.$transaction(async (tx: any) => {
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

    if (!user || !checkPassword(password, user.password)) {
        throw new ApiError("Invalid email or password", 401);
    }

    if (!user.isActive) {
        throw new ApiError("User account is deactivated", 403);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

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
