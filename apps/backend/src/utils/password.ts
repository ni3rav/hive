import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { db } from '../db';
import { passwordResetLinksTable } from '../db/schema';
import logger from '../logger';

const SALT_ROUNDS = 12;
const RESET_PASSWORD_LINK_AGE = 1000 * 60 * 15; // 15 minutes

export async function hashPassword(
  password: string,
): Promise<[Error, null] | [null, string]> {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return [null, hash];
  } catch (err) {
    logger.error(err, 'Error hashing password');
    return [err as Error, null];
  }
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<[Error | null, boolean | null]> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return [null, isValid];
  } catch (err) {
    logger.error(err, 'Error verifying password');
    return [err as Error, null];
  }
}

export function generateResetToken() {
  return randomBytes(32).toString('hex');
}

type ResetLink = typeof passwordResetLinksTable.$inferInsert;

export async function createResetPasswordLink(
  id: string,
  email: string,
): Promise<[Error, null] | [null, ResetLink]> {
  try {
    const expiresAtDate = new Date(Date.now() + RESET_PASSWORD_LINK_AGE);
    const expiresAt = new Date(
      Date.UTC(
        expiresAtDate.getUTCFullYear(),
        expiresAtDate.getUTCMonth(),
        expiresAtDate.getUTCDate(),
        expiresAtDate.getUTCHours(),
        expiresAtDate.getUTCMinutes(),
        expiresAtDate.getUTCSeconds(),
        expiresAtDate.getUTCMilliseconds(),
      ),
    );
    const [link] = await db
      .insert(passwordResetLinksTable)
      .values({
        userId: id,
        email,
        token: generateResetToken(),
        expiresAt,
      })
      .returning();
    return [null, link];
  } catch (error) {
    logger.error(error, 'Error creating reset password link');
    return [error as Error, null];
  }
}
