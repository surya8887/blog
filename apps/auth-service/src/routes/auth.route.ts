import { Router } from "express";
import { protect } from "@blog/common";
import { validate } from "../middleware/validate.middleware.js";
import { signupSchema, loginSchema, googleLoginSchema, changePasswordSchema } from "../validation/auth.validation.js";
import { signup, login, logout, googleLogin, changePassword, refreshToken } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/google", validate(googleLoginSchema), googleLogin);
router.post("/logout", protect, logout);
router.put("/password", protect, validate(changePasswordSchema), changePassword);

export default router;
