import express from "express";
import { router as authRouter } from "./routes/auth";

export const app = express();

app.use(express.json())
app.use("/api/auth", authRouter);
