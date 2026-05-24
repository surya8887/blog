import multer, { Multer, Options } from "multer";

export interface UploadOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
}

/**
 * Creates a configured Multer middleware instance using Memory Storage.
 *
 * @param options - Configuration options for file size and allowed types.
 * @returns A Multer instance ready to be used as Express middleware.
 */
export const createUploadMiddleware = (options: UploadOptions = {}): Multer => {
  const maxSize = (options.maxSizeMB || 5) * 1024 * 1024;
  const allowedMimeTypes = options.allowedMimeTypes || ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const storage = multer.memoryStorage();

  const multerOptions: Options = {
    storage,
    limits: {
      fileSize: maxSize,
    },
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`));
      }
    },
  };

  return multer(multerOptions);
};
