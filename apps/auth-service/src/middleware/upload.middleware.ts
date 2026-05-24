import { createUploadMiddleware } from '@blog/common';

// Create a custom upload middleware instance for the auth-service
// Allows 5MB max size and standard web image formats.
export const upload = createUploadMiddleware({
  maxSizeMB: 5,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
});
