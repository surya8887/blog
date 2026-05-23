import { Router } from "express";
import { protect } from "@blog/common";
import { validate } from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validation/profile.validation.js";
import { getMe, updateMe } from "../controllers/profile.controller.js";

const router = Router();

router.use(protect); // All profile routes are protected

router.route("/me")
    .get(getMe)
    .put(validate(updateProfileSchema), updateMe);

export default router;
