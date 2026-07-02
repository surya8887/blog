import express from "express";
import cookieParser from "cookie-parser";
import type { Application } from "express";
import "./config/cloudinary.js";

export const app:Application = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static("public"))

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Blog service is healthy" });
});

// Routes
import categoryRouter from "./routes/category.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import uploadRouter from "./routes/upload.route.js";
import adminRouter from "./routes/admin.route.js";

app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/admin", adminRouter);

// error handlers
import { errorHandler } from "@blog/common";
app.use(errorHandler);



export default app;