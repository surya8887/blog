import { Router } from "express";
import { protect } from "@blog/common";
import { validate } from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validation/profile.validation.js";
import { getMe, updateMe, uploadAvatar, uploadCover } from "../controllers/profile.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.use(protect); // All profile routes are protected

router.route("/me")
    .get(getMe)
    .put(validate(updateProfileSchema), updateMe);

router.post("/me/avatar", upload.single("profilePicture"), uploadAvatar);
router.post("/me/cover", upload.single("coverPicture"), uploadCover);

export default router;
