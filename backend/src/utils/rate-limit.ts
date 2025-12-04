import { db } from '../db';
import { emailRateLimitsTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import logger from '../logger';

export const RATE_LIMIT_WINDOW_SECONDS = 300;

export const EMAIL_TYPES = {
  VERIFICATION: 'VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  WORKSPACE_INVITATION: 'WORKSPACE_INVITATION',
} as const;

export type EmailType = (typeof EMAIL_TYPES)[keyof typeof EMAIL_TYPES];

export async function checkEmailRateLimit(
  identifier: string,
  type: EmailType,
): Promise<[Error | null, boolean]> {
  try {
    const rateLimit = await db.query.emailRateLimitsTable.findFirst({
      where: and(
        eq(emailRateLimitsTable.identifier, identifier),
        eq(emailRateLimitsTable.type, type),
      ),
    });

    if (!rateLimit) {
      return [null, true];
    }

    const now = new Date();
    const nowUTC = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      ),
    );

    const lastSentUTC = new Date(
      Date.UTC(
        rateLimit.lastSentAt.getUTCFullYear(),
        rateLimit.lastSentAt.getUTCMonth(),
        rateLimit.lastSentAt.getUTCDate(),
        rateLimit.lastSentAt.getUTCHours(),
        rateLimit.lastSentAt.getUTCMinutes(),
        rateLimit.lastSentAt.getUTCSeconds(),
        rateLimit.lastSentAt.getUTCMilliseconds(),
      ),
    );

    const timeDiff = nowUTC.getTime() - lastSentUTC.getTime();
    return [null, timeDiff > RATE_LIMIT_WINDOW_SECONDS * 1000];
  } catch (error) {
    logger.error(error, 'Error checking email rate limit');
    return [error as Error, false];
  }
}

export async function updateEmailRateLimit(
  identifier: string,
  type: EmailType,
): Promise<[Error | null, boolean]> {
  try {
    const now = new Date();
    const nowUTC = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      ),
    );

    await db
      .insert(emailRateLimitsTable)
      .values({
        identifier,
        type,
        lastSentAt: nowUTC,
      })
      .onConflictDoUpdate({
        target: [emailRateLimitsTable.identifier, emailRateLimitsTable.type],
        set: {
          lastSentAt: nowUTC,
        },
      });
    return [null, true];
  } catch (error) {
    logger.error(error, 'Error updating email rate limit');
    return [error as Error, false];
  }
}
