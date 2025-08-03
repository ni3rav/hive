import { NextFunction, Request, Response } from "express";
import { getSession } from "../utils/sessions";

export async function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const raw = req.cookies["session_id"];
  if (!raw) return next();

  const session = await getSession(raw);
  if (session) {
    req.session = session;
  }

  next();
}
