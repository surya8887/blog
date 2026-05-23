import express from "express";
import type { Application } from "express";

export const app:Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))

// error handlers
import { errorHandler } from "@blog/common";
app.use(errorHandler)




export default app;