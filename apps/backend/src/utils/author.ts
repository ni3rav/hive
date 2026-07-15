import { db } from '../db';
import { authorTable } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { getWorkspaceBySlug } from './workspace';

export async function getAuthorsByWorkspaceSlug(workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const result = await db.query.authorTable.findMany({
      where: eq(authorTable.workspaceId, workspace.id),
    });
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function createAuthor(
  workspaceSlug: string,
  data: {
    name: string;
    email: string;
    about?: string;
    socialLinks?: Record<string, string>;
  },
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const [author] = await db
      .insert(authorTable)
      .values({
        workspaceId: workspace.id,
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
  workspaceSlug: string,
  data: {
    name?: string;
    email?: string;
    about?: string;
    socialLinks?: Record<string, string>;
  },
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const result = await db
      .update(authorTable)
      .set(data)
      .where(
        and(
          eq(authorTable.id, authorId),
          eq(authorTable.workspaceId, workspace.id),
        ),
      )
      .returning();
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function deleteAuthor(authorId: string, workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const result = await db
      .delete(authorTable)
      .where(
        and(
          eq(authorTable.id, authorId),
          eq(authorTable.workspaceId, workspace.id),
        ),
      );

    if (result.rowCount === 0) {
      return [new Error('author not found or already deleted'), null] as const;
    }
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}
