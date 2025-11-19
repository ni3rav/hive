import { Request, Response } from 'express';
import {
  createResetPasswordLink,
  hashPassword,
  verifyPassword,
} from '../utils/password';
import { db } from '../db';
import {
  passwordResetLinksTable,
  sessionsTable,
  usersTable,
  verificationLinksTable,
} from '../db/schema';
import {
  generateResetLinkSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../utils/validations/auth';
import {
  createSession,
  generateVerificationLinkToken,
  getUserIdbySession,
} from '../utils/sessions';
import { eq, and, gt } from 'drizzle-orm';
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
import { getUserFromEmail } from '../utils/user';
import { env } from '../env';
import { sendEmail } from '../utils/email';
import {
  verificationEmail,
  passwordResetEmail,
  VERIFICATION_EMAIL_FROM,
  PASSWORD_RESET_EMAIL_FROM,
} from '../templates';
import logger from '../logger';

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

  try {
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
      logger.error(hashError);
      return serverError(res, 'Internal Server Error while Registering');
    }

    // TODO: extract this into a separate function since we will need to use this in login as well and maybe forget password too
    const { token, expiresAt } = generateVerificationLinkToken();

    //* wrapping operations in transaction
    const user = await db.transaction(async (tx) => {
      //* creating user
      const [user] = await tx
        .insert(usersTable)
        .values({ name, email, password: hashedPassword, emailVerified: false })
        .returning();

      //* storing verification link in db
      await tx.insert(verificationLinksTable).values({
        userId: user.id,
        token: token,
        expiresAt: expiresAt,
      });

      return user;
    });

    const verificationLink = `${env.FRONTEND_URL}/verify?userId=${user.id}&token=${token}`;

    const [emailError] = await sendEmail({
      to: user.email,
      subject: 'Verify your email - Hive',
      html: verificationEmail({
        name: user.name,
        verificationLink,
      }),
      from: VERIFICATION_EMAIL_FROM,
    });

    if (emailError) {
      logger.error(emailError, 'Failed to send verification email');
    }

    return created(
      res,
      'User registered successfully. Please check your email to verify your account.',
      {
        userId: user.id,
      },
    );
  } catch (error) {
    logger.error(error, 'Error in registerController');
    return serverError(res, 'Failed to register user');
  }
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

  try {
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
    const [verifyError, isValid] = await verifyPassword(
      password,
      user.password,
    );

    if (verifyError || !isValid) {
      return unauthorized(res, 'Invalid email or password');
    }

    //* email verification check
    if (!user.emailVerified) {
      // TODO: replace it with the common verification link generator function later
      const { token, expiresAt } = generateVerificationLinkToken();

      //* storing verification link in db
      await db.insert(verificationLinksTable).values({
        userId: user.id,
        token: token,
        expiresAt: expiresAt,
      });

      const verificationLink = `${env.FRONTEND_URL}/verify?userId=${user.id}&token=${token}`;

      const [emailError] = await sendEmail({
        to: user.email,
        subject: 'Verify your email - Hive',
        html: verificationEmail({
          name: user.name,
          verificationLink,
        }),
        from: VERIFICATION_EMAIL_FROM,
      });

      if (emailError) {
        logger.error(emailError, 'Failed to send verification email');
      }

      return forbidden(
        res,
        "Email not verified. We've sent a new verification link to your email.",
      );
    }

    //* creating session and setting cookies
    const [sessionError, session] = await createSession(user.id);

    if (sessionError || !session) {
      return serverError(res, 'Failed to create session');
    }

    setSessionCookie(res, session.sessionId, session.expiresAt);

    return ok(res, 'Logged in successfully');
  } catch (error) {
    logger.error(error, 'Error in loginController');
    return serverError(res, 'Failed to login');
  }
}

export async function logoutController(req: Request, res: Response) {
  const sessionId: string = req.cookies['session_id'];

  try {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

    clearSessionCookie(res);

    return ok(res, 'Logged out successfully');
  } catch (error) {
    logger.error(error, 'Error in logoutController');
    return serverError(res, 'Failed to logout');
  }
}

export async function meController(req: Request, res: Response) {
  const sessionId: string = req.cookies['session_id'];

  const [, userId] = await getUserIdbySession(sessionId);

  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId!),
    });

    if (!user) {
      return notFound(res, 'User not found');
    }

    return ok(res, 'User retrieved successfully', {
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    logger.error(error, 'Error in meController');
    return serverError(res, 'Failed to retrieve user');
  }
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

  try {
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

    //* wrapping operations in transaction
    await db.transaction(async (tx) => {
      //* updating user to set emailVerified to true
      await tx
        .update(usersTable)
        .set({ emailVerified: true })
        .where(eq(usersTable.id, userId));

      //* deleting all verification links for this user
      await tx
        .delete(verificationLinksTable)
        .where(eq(verificationLinksTable.userId, userId));

      //* creating session and setting cookies
      const [sessionError, session] = await createSession(userId, tx);

      if (sessionError || !session) {
        throw new Error('Failed to create session');
      }

      setSessionCookie(res, session.sessionId, session.expiresAt);
    });

    return ok(res, 'Email verified and logged in successfully');
  } catch (error) {
    logger.error(error, 'Error in verifyController');
    return serverError(res, 'Failed to verify email');
  }
}

export async function generateResetPasswordLinkController(
  req: Request,
  res: Response,
) {
  const validatedBody = generateResetLinkSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid Email Address',
      validatedBody.error.message,
    );
  }
  const userEmail = validatedBody.data.email;

  const [error, user] = await getUserFromEmail(userEmail);

  if (error?.message === 'No user found') {
    return notFound(
      res,
      'No user found',
      'Check if correct email address was entered or not',
    );
  } else if (error) {
    logger.error(error, 'Error in generateResetPasswordLinkController');
    return serverError(res, 'Error while fetching user');
  }

  const { id, email } = user;
  const [linkError, link] = await createResetPasswordLink(id, email);

  if (linkError || !link) {
    return serverError(res, 'Error while creating reset password link');
  }

  const resetLink = `${env.FRONTEND_URL}/reset?email=${link.email}&token=${link.token}`;

  const [emailError] = await sendEmail({
    to: user.email,
    subject: 'Reset your password - Hive',
    html: passwordResetEmail({
      name: user.name,
      resetLink,
    }),
    from: PASSWORD_RESET_EMAIL_FROM,
  });

  if (emailError) {
    logger.error(emailError, 'Failed to send password reset email');
    return serverError(res, 'Failed to send password reset email');
  }

  return created(
    res,
    'Password reset link sent to your email. Please check your inbox.',
  );
}

export async function resetPasswordController(req: Request, res: Response) {
  const validatedBody = resetPasswordSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  const { email, token, password } = validatedBody.data;
  try {
    const link = await db.query.passwordResetLinksTable.findFirst({
      where: and(
        eq(passwordResetLinksTable.email, email),
        eq(passwordResetLinksTable.token, token),
        gt(passwordResetLinksTable.expiresAt, new Date()),
      ),
    });
    if (!link) {
      return notFound(
        res,
        'No link found with given email and token',
        'Try requesting new reset password link',
      );
    }
    const [hashPassowrdError, newHashedPassword] = await hashPassword(password);

    if (hashPassowrdError || !newHashedPassword) {
      logger.error(hashPassowrdError);
      return serverError(res, 'Internal server error while resetting password');
    }

    const [userError, user] = await getUserFromEmail(email);

    if (userError) {
      logger.error(userError);
      return serverError(res, 'Error while resetting password for the user');
    }

    if (!user) {
      return notFound(res, 'Unable to find user while resetting password');
    }

    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({ password: newHashedPassword })
        .where(
          and(eq(usersTable.email, user.email), eq(usersTable.id, user.id)),
        );
      await tx.delete(sessionsTable).where(eq(sessionsTable.userId, user.id));
      await tx
        .delete(passwordResetLinksTable)
        .where(
          and(
            eq(passwordResetLinksTable.email, email),
            eq(passwordResetLinksTable.token, token),
            gt(passwordResetLinksTable.expiresAt, new Date()),
          ),
        );
      await tx
        .delete(verificationLinksTable)
        .where(eq(verificationLinksTable.userId, user.id));
    });
    return ok(res, 'Password reset successfully');
  } catch (error) {
    logger.error(error, 'Error in resetPasswordController');
    return serverError(res, 'Error while resetting password');
  }
}
