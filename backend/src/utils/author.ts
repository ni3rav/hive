/*
import { db } from '../db';
import { authorTable } from '../db/schema';
import { and, eq } from 'drizzle-orm';

export async function getAuthorsByUserId(userId: string) {
  try {
    const result = await db.query.authorTable.findMany({
      where: eq(authorTable.userId, userId),
    });
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function createAuthor(
  userId: string,
  data: {
    name: string;
    email: string;
    about?: string;
    socialLinks?: Record<string, string>;
  },
) {
  try {
    const [author] = await db
      .insert(authorTable)
      .values({
        userId,
        ...data,
      })
      .returning();

    return [null, author] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function updateAuthor(
  authorId: string,
  userId: string,
  data: {
    name?: string;
    email?: string;
    about?: string;
    socialLinks?: Record<string, string>;
  },
) {
  try {
    const result = await db
      .update(authorTable)
      .set(data)
      .where(and(eq(authorTable.id, authorId), eq(authorTable.userId, userId)))
      .returning();
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function deleteAuthor(authorId: string, userId: string) {
  try {
    const result = await db
      .delete(authorTable)
      .where(and(eq(authorTable.id, authorId), eq(authorTable.userId, userId)));

    if (result.rowCount === 0) {
      return [new Error('author not found or already deleted'), null] as const;
    }
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}
*/

function disabledError() {
  return new Error('author utilities temporarily disabled');
}

export async function getAuthorsByUserId(_userId: string) {
  void _userId;
  return [disabledError(), null] as const;
}

export async function createAuthor(
  _userId: string,
  _data: {
    name: string;
    email: string;
    about?: string;
    socialLinks?: Record<string, string>;
  },
) {
  void _userId;
  void _data;
  return [disabledError(), null] as const;
}

export async function updateAuthor(
  _authorId: string,
  _userId: string,
  _data: {
    name?: string;
    email?: string;
    about?: string;
    socialLinks?: Record<string, string>;
  },
) {
  void _authorId;
  void _userId;
  void _data;
  return [disabledError(), null] as const;
}

export async function deleteAuthor(_authorId: string, _userId: string) {
  void _authorId;
  void _userId;
  return [disabledError(), null] as const;
}
