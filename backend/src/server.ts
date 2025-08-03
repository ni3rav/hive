import express from "express";
import { router as authRouter } from "./routes/auth";
import "./types/express-session"

export const app = express();

app.use("/api/auth", authRouter);
