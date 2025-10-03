import { Request, Response } from 'express';
import { hashPassword, verifyPassword } from '../utils/password';
import { db } from '../db';
import {
  sessionsTable,
  usersTable,
  verificationLinksTable,
} from '../db/schema';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from '../utils/validations/auth';
import {
  createSession,
  getUserIdbySession,
  VERIFICATION_LINK_AGE,
} from '../utils/sessions';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import {
  validationError,
  conflict,
  created,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  ok,
  badRequest,
} from '../utils/responses';
import { setSessionCookie, clearSessionCookie } from '../utils/cookie';

export async function registerController(req: Request, res: Response) {
  //* validating reqeust body
  const validatedBody = registerSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }
  const { name, email, password } = validatedBody.data;

  //* email check
  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (existingUser) {
    return conflict(res, 'Email already registered');
  }

  //* hashing password
  const [hashError, hashedPassword] = await hashPassword(password);

  if (hashError || !hashedPassword) {
    return serverError(res, 'Failed to hash password');
  }

  //* creating user
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password: hashedPassword, emailVerified: false })
    .returning();

  // TODO: extract this into a separate function since we will need to use this in login as well and maybe forget password too
  const verificationLinkToken = randomBytes(32).toString('hex');
  const verificationLinkExpiresAt = new Date(
    Date.now() + VERIFICATION_LINK_AGE,
  ); // 15 minutes

  //* storing verification link in db
  await db.insert(verificationLinksTable).values({
    userId: user.id,
    token: verificationLinkToken,
    expiresAt: verificationLinkExpiresAt,
  });

  // TODO: In production, send verification link via email instead of response
  return created(res, 'User registered successfully', {
    userId: user.id,
    verificationLinkToken,
    verificationLinkExpiresAt,
  });
}

export async function loginController(req: Request, res: Response) {
  //* validating reqeust body
  const validatedBody = loginSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
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
    return unauthorized(res, 'Invalid email or password');
  }

  //* password verification
  const [verifyError, isValid] = await verifyPassword(password, user.password);

  if (verifyError || !isValid) {
    return unauthorized(res, 'Invalid email or password');
  }

  //* email verification check
  if (!user.emailVerified) {
    // TODO: replace it with the common verification link generator function later
    const verificationLinkToken = randomBytes(32).toString('hex');
    const verificationLinkExpiresAt = new Date(
      Date.now() + VERIFICATION_LINK_AGE,
    ); // 15 minutes

    //* storing verification link in db
    await db.insert(verificationLinksTable).values({
      userId: user.id,
      token: verificationLinkToken,
      expiresAt: verificationLinkExpiresAt,
    });

    // TODO: for now, returning token but send it via email later
    return forbidden(res, 'Email not verified', {
      userId: user.id,
      verificationLinkToken,
      verificationLinkExpiresAt,
    });
  }

  //* creating session and setting cookies
  const [sessionError, session] = await createSession(user.id);

  if (sessionError || !session) {
    return serverError(res, 'Failed to create session');
  }

  setSessionCookie(res, session.sessionId, session.expiresAt);

  return ok(res, 'Logged in successfully');
}

export async function logoutController(req: Request, res: Response) {
  const sessionId: string = req.cookies['session_id'];

  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

  clearSessionCookie(res);

  return ok(res, 'Logged out successfully');
}

export async function meController(req: Request, res: Response) {
  const sessionId: string = req.cookies['session_id'];

  const [, userId] = await getUserIdbySession(sessionId);

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId!),
  });

  if (!user) {
    return notFound(res, 'User not found');
  }

  return ok(res, 'User retrieved successfully', {
    name: user.name,
    email: user.email,
  });
}

export async function verifyController(req: Request, res: Response) {
  //* validating request body
  const validatedBody = verifyEmailSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }
  const { userId, token } = validatedBody.data;

  //* fetching verification link from db
  const verificationLink = await db.query.verificationLinksTable.findFirst({
    where: and(
      eq(verificationLinksTable.userId, userId),
      eq(verificationLinksTable.token, token),
    ),
  });

  if (!verificationLink) {
    return notFound(res, 'Verification link not found');
  }

  if (new Date() > new Date(verificationLink.expiresAt)) {
    // !lazy deletion on check
    await db
      .delete(verificationLinksTable)
      .where(eq(verificationLinksTable.id, verificationLink.id));
    return badRequest(res, 'Verification link expired');
  }

  //* updating user to set emailVerified to true
  await db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(eq(usersTable.id, userId));

  //* deleting all verification links for this user
  await db
    .delete(verificationLinksTable)
    .where(eq(verificationLinksTable.userId, userId));

  //* creating session and setting cookies
  const [sessionError, session] = await createSession(userId);

  if (sessionError || !session) {
    return serverError(res, 'Failed to create session');
  }

  setSessionCookie(res, session.sessionId, session.expiresAt);

  return ok(res, 'Email verified and logged in successfully');
}
