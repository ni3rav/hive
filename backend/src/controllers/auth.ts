import { Request, Response } from "express";
import { hashPassword, verifyPassword } from "../utils/password";
import { db } from "../db";
import {
  sessionsTable,
  usersTable,
  verificationLinksTable,
} from "../db/schema";
import { loginSchema, registerSchema } from "../utils/validations/auth";
import { createSession } from "../utils/sessions";
import { env } from "../env";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function registerController(req: Request, res: Response) {
  //* validating reqeust body
  const validatedBody = registerSchema.safeParse(req.body);

  if (!validatedBody.success) {
    res.status(400).json({
      message: "Invalid Payload",
    });
    return;
  }
  const { name, email, password } = validatedBody.data;

  //* email check
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

  //* hashing password
  const hashedPassword = await hashPassword(password);

  //* creating user
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password: hashedPassword, emailVerified: false })
    .returning();

  // TODO: extract this into a separate function since we will need to use this in login as well and maybe forget password too
  const verificationLinkToken = randomBytes(32).toString("hex");
  const verificationLinkExpiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  //* currently sending at response, in future we can send it via email now we will consume this link in /verify endpoint so this endpoint would just return success message
  res.status(201).json({
    userId: user.id,
    verificationLinkToken,
    verificationLinkExpiresAt,
  });
}

export async function loginController(req: Request, res: Response) {
  //* validating reqeust body
  const validatedBody = loginSchema.safeParse(req.body);

  if (!validatedBody.success) {
    res.status(400).json({
      message: "Invalid Payload",
    });
    return;
  }
  const { email, password } = validatedBody.data;

  //* finding user in db
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .then((res) => res[0]);

  //* user not found
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  //* passwrod verification
  if (!(await verifyPassword(password, user.password))) {
    res.status(401).json({ message: "Password did not match" });
    return;
  }

  //* email verification check
  if (!user.emailVerified) {
    // TODO: replace it with the common verification link generator function later, but here it should not directly trigger email sending rather wait for user to hit /resend-verification endpoint if they want to (let's keep it for later)
    const verificationLinkToken = randomBytes(32).toString("hex");
    const verificationLinkExpiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    res
      .status(403)
      .json({
        message: "email not verified",
        userId: user.id,
        verificationLinkToken,
        verificationLinkExpiresAt,
      });
    return;
  }

  //* creating session and setting cookies in the end
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
