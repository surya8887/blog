import { prisma } from "../config/db.js";
import { ApiError } from "@blog/common";
import { 
    hashPassword, 
    checkPassword, 
    generateAccessToken, 
    generateRefreshToken 
} from "../utils/auth.utils.js";
import { auth } from "../config/firebase.js";

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

    if (!user || !user.password || !checkPassword(password, user.password)) {
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

export const googleLoginService = async (idToken: string) => {
    try {
        if (!auth) {
            throw new ApiError("Firebase Admin not configured. Cannot process Google login.", 500);
        }
        
        const decodedToken = await auth.verifyIdToken(idToken);
        const { email, name, picture } = decodedToken;

        if (!email) {
            throw new ApiError("Email not provided by Google", 400);
        }

        let user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });

        if (!user) {
            // Split name into firstName and lastName
            let firstName = name || "User";
            let lastName = "";
            if (name && name.includes(" ")) {
                const parts = name.split(" ");
                firstName = parts[0];
                lastName = parts.slice(1).join(" ");
            }

            user = await prisma.$transaction(async (tx: any) => {
                const newUser = await tx.user.create({
                    data: {
                        email,
                        isVerified: true, // Google emails are already verified
                        profile: {
                            create: {
                                firstName,
                                lastName,
                                profilePicture: picture || null
                            }
                        }
                    },
                    include: {
                        profile: true
                    }
                });
                return newUser;
            });
        }

        if (!user) {
            throw new ApiError("Failed to authenticate user", 500);
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
    } catch (error: any) {
        console.error("Firebase verifyIdToken error:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Invalid or expired Google ID token", 401);
    }
};
