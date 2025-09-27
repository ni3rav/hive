import { db } from "../db";
import { sessionsTable } from "../db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { sessionIdSchema } from "./validations/author";

export async function createSession(userId: string) {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await db.insert(sessionsTable).values({ id: sessionId, userId, expiresAt });

  return { sessionId, expiresAt };
}

export async function getUserIdbySession(
  sessionId: string
): Promise<[Error | null, string | null]> {
  const validatedData = sessionIdSchema.safeParse({ sessionId });

  if (!validatedData.success) {
    return [new Error("invalid session id"), null];
  }

  try {
    const session = await db.query.sessionsTable.findFirst({
      where: (sessionsTable, { eq }) =>
        eq(sessionsTable.id, validatedData.data.sessionId),
    });

    if (!session) {
      return [new Error("session not found"), null];
    }

    if (new Date() > new Date(session.expiresAt)) {
      await db
        .delete(sessionsTable)
        .where(eq(sessionsTable.id, validatedData.data.sessionId));
      return [new Error("session expired"), null];
    }

    return [null, session.userId];
  } catch (err) {
    return [err as Error, null];
  }
}
