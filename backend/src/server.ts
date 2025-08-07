import express from "express";
import { router as authRouter } from "./routes/auth";
import cookieParser from "cookie-parser";
import { env } from "./env";
import morgan from "morgan";

export const app = express();

app.use(cookieParser());
app.use(express.json());

if (env.isProd) {
  app.use(morgan("dev"));
}

app.use("/api/auth", authRouter);
