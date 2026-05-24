import { v2 as cloudinary, UploadApiResponse, UploadApiOptions, DeleteApiResponse } from "cloudinary";
import { ApiError } from "../apiError/index.js";

/**
 * Service class for interacting with Cloudinary.
 * Designed to be instantiated with specific configurations if needed, 
 * or used with default globally configured Cloudinary v2 SDK.
 */
export class CloudinaryService {
  
  /**
   * Uploads a file buffer directly to Cloudinary using streams.
   * 
   * @param buffer - The file buffer from Multer.
   * @param options - Cloudinary upload options (e.g., folder, public_id, transformation).
   * @returns A promise resolving to the strict UploadApiResponse.
   */
  public async uploadImage(
    buffer: Buffer,
    options: UploadApiOptions
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary Upload Error:", error);
            return reject(new ApiError(`Failed to upload image to Cloudinary: ${error?.message || 'Unknown error'}`, 500));
          }
          resolve(result);
        }
      );
      stream.end(buffer);
    });
  }

  /**
   * Deletes an image from Cloudinary using its public ID.
   * 
   * @param publicId - The Cloudinary public ID of the file to delete.
   * @returns A promise resolving to the Cloudinary delete response.
   */
  public async deleteImage(publicId: string): Promise<DeleteApiResponse> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new ApiError("Failed to delete image from Cloudinary", 500);
    }
  }
}

// Export a default singleton instance for convenience
export const cloudinaryService = new CloudinaryService();
