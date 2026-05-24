import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../apiError/index.js";

// Cloudinary needs to be configured where it is initialized (e.g. by the microservice using it).
// The microservice will call cloudinary.config(...) with its own env vars.

/**
 * Uploads a file buffer directly to Cloudinary using streams.
 * 
 * @param buffer - The file buffer from Multer.
 * @param folder - The Cloudinary folder to upload the file to.
 * @param publicId - Optional public ID for the file.
 * @returns A promise resolving to the Cloudinary upload result.
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  publicId?: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError("Failed to upload image to Cloudinary", 500));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * 
 * @param publicId - The Cloudinary public ID of the file to delete.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new ApiError("Failed to delete image from Cloudinary", 500);
  }
};
