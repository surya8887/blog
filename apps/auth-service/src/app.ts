import express from "express";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import "./config/cloudinary.js";
import type { Application } from "express";

export const app:Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"))

// routes
import authRouter from "./routes/auth.route.js";
import profileRouter from "./routes/profile.route.js";

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/profiles', profileRouter);

// error handlers
import { errorHandler } from "@blog/common";
app.use(errorHandler)




export default app;