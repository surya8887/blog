import { prisma } from "../config/db.js";
import { ApiError } from "@blog/common";

// Removed manual instantiation of prisma

export const getProfileService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    const { password: _, refreshToken: __, ...userWithoutSensitiveInfo } = user;
    return userWithoutSensitiveInfo;
};

export const updateProfileService = async (userId: string, data: any) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    // Prepare profile update data, handling nested objects like socialLinks
    const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: data
    });

    const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    const { password: _, refreshToken: __, ...userWithoutSensitiveInfo } = updatedUser!;
    return userWithoutSensitiveInfo;
};
