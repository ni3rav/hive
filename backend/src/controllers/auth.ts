import { Request, Response } from "express";
import { hashPassword } from "../utils/password";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { registerSchema } from "../utils/validations/auth";
import { createSession } from "../utils/sessions";
import { env } from "../env";

export async function registerController(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid Payload",
    });
  }
  const { name, email, password } = result.data;
  const hashedPassword = await hashPassword(password);

  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password: hashedPassword })
    .returning();

  const { sessionId, expiresAt } = await createSession(user.id);
  res.cookie("session_id", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    expires: expiresAt,
  });

  res.status(201).json({ userId: user.id });
}
