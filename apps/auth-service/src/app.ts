import express from "express";
import { env } from "./config/env.js";
import type { Application } from "express";

export const app:Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))






export default app;