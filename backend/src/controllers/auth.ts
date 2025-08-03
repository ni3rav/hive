import { Request, Response } from "express";
import { hashPassword } from "../utils/password";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { registerSchema } from "../utils/validations/auth";
import { createSession } from "../utils/sessions";
import { env } from "../env";
import { eq } from "drizzle-orm";

export async function registerController(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid Payload",
    });
  }
  const { name, email, password } = result.data;

  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email already registered",
      suggestion: "Try logging in or use password recovery",
    });
  }

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
