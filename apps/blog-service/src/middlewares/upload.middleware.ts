import { createUploadMiddleware } from "@blog/common";

// Multer middleware for blog cover images (5MB max, standard image formats)
const uploadMiddleware = createUploadMiddleware({
    maxSizeMB: 5,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
});

// Export as a single-file upload handler expecting field name "image"
export const uploadImage = uploadMiddleware.single("image");
