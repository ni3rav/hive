import { db } from "../db";
import { sessionsTable } from "../db/schema";
import { randomUUID } from "crypto";

export async function createSession(userId: string) {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await db.insert(sessionsTable).values({ id: sessionId, userId, expiresAt });

  return { sessionId, expiresAt };
}