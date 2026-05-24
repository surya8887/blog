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

import cloudinary from "../config/cloudinary.js";

export const uploadImageService = async (userId: string, imageType: "profilePicture" | "coverPicture", buffer: Buffer) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (!user || !user.profile) {
        throw new ApiError("User profile not found", 404);
    }

    // Upload to Cloudinary using stream
    const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: `devblog/${imageType}s`,
                public_id: `${userId}-${Date.now()}`,
            },
            (error, result) => {
                if (error) return reject(new ApiError("Failed to upload image to Cloudinary", 500));
                resolve(result);
            }
        );
        stream.end(buffer);
    });

    const secureUrl = uploadResult.secure_url;

    // Update database
    await prisma.profile.update({
        where: { userId },
        data: {
            [imageType]: secureUrl
        }
    });

    // Return updated user
    const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    const { password: _, refreshToken: __, ...userWithoutSensitiveInfo } = updatedUser!;
    return userWithoutSensitiveInfo;
};
