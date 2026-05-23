import { Router } from "express";
import { protect } from "@blog/common";
import { validate } from "../middleware/validate.middleware.js";
import { signupSchema, loginSchema } from "../validation/auth.validation.js";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", protect, logout);

export default router;
