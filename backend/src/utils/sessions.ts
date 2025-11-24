import { db } from '../db';
import { sessionsTable } from '../db/schema';
import { randomBytes, randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { sessionIdSchema } from './validations/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import logger from '../logger';

export const SESSION_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
export const VERIFICATION_LINK_AGE = 1000 * 60 * 15; // 15 minutes

function getNowUTC(): Date {
  const now = new Date();
  return new Date(
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
}

export function generateVerificationLinkToken() {
  const expiresAt = new Date(Date.now() + VERIFICATION_LINK_AGE);
  return {
    token: randomBytes(32).toString('hex'),
    expiresAt: new Date(
      Date.UTC(
        expiresAt.getUTCFullYear(),
        expiresAt.getUTCMonth(),
        expiresAt.getUTCDate(),
        expiresAt.getUTCHours(),
        expiresAt.getUTCMinutes(),
        expiresAt.getUTCSeconds(),
        expiresAt.getUTCMilliseconds(),
      ),
    ),
  };
}

export async function createSession(
  userId: string,
  tx?: NodePgDatabase<typeof schema> | typeof db,
): Promise<[Error | null, { sessionId: string; expiresAt: Date } | null]> {
  const sessionId = randomUUID();
  const expiresAtDate = new Date(Date.now() + SESSION_AGE);
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
  const dbInstance = tx || db;

  try {
    await dbInstance
      .insert(sessionsTable)
      .values({ id: sessionId, userId, expiresAt });
    return [null, { sessionId, expiresAt }];
  } catch (err) {
    logger.error(err, 'Error creating session');
    return [err as Error, null];
  }
}

export async function getUserIdbySession(
  sessionId: string,
): Promise<[Error | null, string | null]> {
  const validatedData = sessionIdSchema.safeParse({ sessionId });

  if (!validatedData.success) {
    return [new Error('invalid session id'), null];
  }

  try {
    const session = await db.query.sessionsTable.findFirst({
      where: (sessionsTable, { eq }) =>
        eq(sessionsTable.id, validatedData.data.sessionId),
    });

    if (!session) {
      return [new Error('session not found'), null];
    }

    const nowUTC = getNowUTC();
    const expiresAtUTC = new Date(
      Date.UTC(
        new Date(session.expiresAt).getUTCFullYear(),
        new Date(session.expiresAt).getUTCMonth(),
        new Date(session.expiresAt).getUTCDate(),
        new Date(session.expiresAt).getUTCHours(),
        new Date(session.expiresAt).getUTCMinutes(),
        new Date(session.expiresAt).getUTCSeconds(),
        new Date(session.expiresAt).getUTCMilliseconds(),
      ),
    );
    if (nowUTC > expiresAtUTC) {
      await db
        .delete(sessionsTable)
        .where(eq(sessionsTable.id, validatedData.data.sessionId));
      return [new Error('session expired'), null];
    }

    return [null, session.userId];
  } catch (err) {
    return [err as Error, null];
  }
}
