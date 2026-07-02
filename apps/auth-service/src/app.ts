import express from "express";
import cookieParser from "cookie-parser";
import "./config/cloudinary.js";
import type { Application } from "express";

export const app: Application = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static("public"))

// routes
import authRouter from "./routes/auth.route.js";
import profileRouter from "./routes/profile.route.js";
import userRouter from "./routes/user.route.js";

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profiles', profileRouter);
app.use('/api/v1/users', userRouter);

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Auth service is healthy" });
})

// error handlers
import { errorHandler } from "@blog/common";
app.use(errorHandler)




export default app;