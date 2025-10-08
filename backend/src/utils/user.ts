import { eq } from 'drizzle-orm';
import { db } from '../db';
import { usersTable } from '../db/schema';

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
    console.error('Error fetching email from user id', error);
    return [error as Error, null];
  }
}
