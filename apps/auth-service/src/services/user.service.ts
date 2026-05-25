import { prisma } from "../config/db.js";
import { ApiError } from "@blog/common";

export const getAllUsersService = async (query: any) => {
    const { page = 1, limit = 10, search } = query;
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    const where: any = search
        ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                {
                    profile: {
                        is: {
                            OR: [
                                { firstName: { contains: search, mode: 'insensitive' } },
                                { lastName: { contains: search, mode: 'insensitive' } },
                            ]
                        }
                    }
                }
            ]
        }
        : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: parsedLimit,
            include: { profile: true },
            orderBy: { createdAt: "desc" }
        }),
        prisma.user.count({ where })
    ]);

    const sanitizedUsers = users.map(user => {
        const { password, refreshToken, ...rest } = user;
        return rest;
    });

    return {
        docs: sanitizedUsers,
        totalDocs: total,
        limit: parsedLimit,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
        hasNextPage: skip + parsedLimit < total,
        hasPrevPage: parsedPage > 1,
    };
};

export const updateUserService = async (userId: string, data: any) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    const updatedData: any = {};
    if (data.role) updatedData.role = data.role;
    if (data.isActive !== undefined) {
        updatedData.isActive = data.isActive;
        if (data.isActive) {
            updatedData.deletedAt = null;
        } else {
            updatedData.deletedAt = new Date();
            updatedData.refreshToken = null; // Invalidate session
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
        include: { profile: true }
    });

    const { password, refreshToken, ...userWithoutSensitiveInfo } = updatedUser;
    return userWithoutSensitiveInfo;
};
