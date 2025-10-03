import { db } from '../db';
import { sessionsTable } from '../db/schema';
import { randomBytes, randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { sessionIdSchema } from './validations/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

export const SESSION_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
export const VERIFICATION_LINK_AGE = 1000 * 60 * 15; // 15 minutes

export function generateVerificationLinkToken() {
  return {
    token: randomBytes(32).toString('hex'),
    expiresAt: new Date(Date.now() + VERIFICATION_LINK_AGE),
  };
}

export async function createSession(
  userId: string,
  tx?: NodePgDatabase<typeof schema> | typeof db,
): Promise<[Error | null, { sessionId: string; expiresAt: Date } | null]> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_AGE);
  const dbInstance = tx || db;

  try {
    await dbInstance
      .insert(sessionsTable)
      .values({ id: sessionId, userId, expiresAt });
    return [null, { sessionId, expiresAt }];
  } catch (err) {
    console.error('Error creating session:', err);
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

    if (new Date() > new Date(session.expiresAt)) {
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
