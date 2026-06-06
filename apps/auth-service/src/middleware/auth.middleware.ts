import type{ Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export interface AuthRequest extends Request {
    cookies: any;
    user?: string | jwt.JwtPayload;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, env.JWT_SECRET || "secret");
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

export { authMiddleware };