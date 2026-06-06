import { Router } from "express";
import { protect } from "@blog/common";
import { uploadImage } from "../middlewares/upload.middleware.js";
import { uploadFile } from "../controllers/upload.controller.js";

const router = Router();

// POST /api/v1/upload — protected, accepts multipart/form-data with field name "image"
router.post("/", protect, uploadImage, uploadFile);

export default router;
