import { db } from "../db";
import { authorTable } from "../db/schema";
import { eq } from "drizzle-orm";

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

export async function getAuthorById(authorId: string, userId: string) {
  try {
    const result = await db.query.authorTable.findFirst({
      where: eq(authorTable.id, authorId) && eq(authorTable.userId, userId),
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
  }
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
  }
) {
  try {
    const result = await db
      .update(authorTable)
      .set(data)
      .where(eq(authorTable.id, authorId) && eq(authorTable.userId, userId));
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function deleteAuthor(authorId: string, userId: string) {
  try {
    const result = await db
      .delete(authorTable)
      .where(eq(authorTable.id, authorId) && eq(authorTable.userId, userId));
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}
