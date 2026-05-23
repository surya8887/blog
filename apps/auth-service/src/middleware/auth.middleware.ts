import type{ Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

export { authMiddleware };