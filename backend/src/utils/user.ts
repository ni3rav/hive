import { eq } from 'drizzle-orm';
import { db } from '../db';
import { usersTable } from '../db/schema';
import logger from '../logger';

export type User = typeof usersTable.$inferSelect;

export async function getUserFromEmail(
  email: string,
): Promise<[null, User] | [Error, null]> {
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    if (!user) {
      return [new Error('No user found'), null];
    }
    return [null, user];
  } catch (error) {
    logger.error(error, 'Error fetching user from email id');
    return [error as Error, null];
  }
}
