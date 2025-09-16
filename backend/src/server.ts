import express from "express";
import { router as authRouter } from "./routes/auth";
import { router as userRouter } from "./routes/user";
import cookieParser from "cookie-parser";
import { env } from "./env";
import morgan from "morgan";
import cors from "cors";

export const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));

app.use(cookieParser());
app.use(express.json());

if (!env.isProd) {
  app.use(morgan("dev"));
}

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);