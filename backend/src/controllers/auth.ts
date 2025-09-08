import { Request, Response } from "express";
import { hashPassword, verifyPassword } from "../utils/password";
import { db } from "../db";
import { sessionsTable, usersTable } from "../db/schema";
import { loginSchema, registerSchema } from "../utils/validations/auth";
import { createSession } from "../utils/sessions";
import { env } from "../env";
import { eq } from "drizzle-orm";

export async function registerController(req: Request, res: Response) {
  const validatedBody = registerSchema.safeParse(req.body);

  if (!validatedBody.success) {
    res.status(400).json({
      message: "Invalid Payload",
    });
    return;
  }
  const { name, email, password } = validatedBody.data;

  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (existingUser) {
    res.status(409).json({
      message: "Email already registered",
      suggestion: "Try logging in or use password recovery",
    });
    return;
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

export async function loginController(req: Request, res: Response) {
  const validatedBody = loginSchema.safeParse(req.body);

  if (!validatedBody.success) {
    res.status(400).json({
      message: "Invalid Payload",
    });
    return;
  }
  const { email, password } = validatedBody.data;

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .then((res) => res[0]);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (!(await verifyPassword(password, user.password))) {
    res.status(401).json({ message: "Password did not match" });
    return;
  }

  const { sessionId, expiresAt } = await createSession(user.id);

  res.cookie("session_id", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    expires: expiresAt,
  });

  res.status(200).json({ message: "Logged In" });
}

export async function logoutController(req: Request, res: Response) {
  const sessionId = req.cookies["session_id"];

  if (!sessionId) {
    res.status(400).json({ message: "No sessionId found" });
    return;
  }

  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

  res.clearCookie("session_id");

  res.status(200).json({ message: "Logged out successfully" });
  return;
}

export async function meController(req: Request, res: Response) {
  const sessionId = req.cookies["session_id"];

  if (!sessionId) {
    res.status(401).json({ message: "No sessionId found please login" });
    return;
  }

  const session = await db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.id, sessionId),
  });

  if (!session) {
    res.status(401).json({ message: "Session not found or expired." });
    return;
  }

  if (new Date() > new Date(session.expiresAt)) {
    // !lazy deleltion on check
    // TODO: Add a cronjob to purge out all inactive sessions at a regular interval
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
    res.status(401).json({ message: "Session expired" });
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.userId),
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}
