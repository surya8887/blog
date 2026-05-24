import type { Request, Response } from "express";
import { asyncHandler, ApiResponse, ApiError, cloudinaryService } from "@blog/common";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// Configure Cloudinary once when this module loads
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME ?? "",
    api_key: env.CLOUDINARY_API_KEY ?? "",
    api_secret: env.CLOUDINARY_API_SECRET ?? "",
});

/**
 * POST /api/v1/upload
 * Expects multipart/form-data with field name "image".
 * Uploads the buffer to Cloudinary and returns the secure URL + public ID.
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new ApiError("No file provided. Please attach an image with field name 'image'.", 400);
    }

    const result = await cloudinaryService.uploadImage(req.file.buffer, {
        folder: "blog/covers",
        resource_type: "image",
        transformation: [
            { width: 1200, height: 630, crop: "fill", quality: "auto", fetch_format: "auto" },
        ],
    });

    res.status(200).json(
        new ApiResponse(
            200,
            { url: result.secure_url, publicId: result.public_id },
            "Image uploaded successfully"
        )
    );
});
