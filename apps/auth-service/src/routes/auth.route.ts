import { Router } from "express";
import { signupHandler } from "../controllers/auth.contorller.js";

const router = Router();

router.route('/signup').post(signupHandler)
router.get("/health", (req, res) => {
    res.json({ message: "OK" });
})

export default router;
