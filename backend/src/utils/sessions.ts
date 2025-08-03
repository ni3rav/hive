import { db } from "../db";
import { sessionsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function createSession(userId: string) {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await db.insert(sessionsTable).values({ id: sessionId, userId, expiresAt });

  return { sessionId, expiresAt };
}

export async function getSession(sessionId: string) {
  const session = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId))
    .then((res) => res[0]);

  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}
