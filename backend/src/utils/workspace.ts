import { db } from '../db';
import { UserWorkspace } from '../types/workspaces';
import { workspacesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import logger from '../logger';

export async function checkSlugExists(slug: string): Promise<boolean> {
  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, slug),
    });
    return !!workspace;
  } catch (error) {
    logger.error(error, 'Error checking slug existence');
    throw error;
  }
}

export async function getUserWorkspaces(
  userId: string,
): Promise<[Error, null] | [null, UserWorkspace[]]> {
  try {
    const query = await db.query.workspaceUsersTable.findMany({
      where: (workspaceUsers, { eq }) => eq(workspaceUsers.userId, userId),
      with: {
        workspace: true,
      },
    });
    const userWorkspaces = query.map((item) => {
      return { ...item.workspace, role: item.role, joinedAt: item.joinedAt };
    });
    return [null, userWorkspaces];
  } catch (error) {
    logger.error(error, 'Error in getUserWorkspace util');
    return [new Error('ERROR WHILE GETTING USER WORKSPACE'), null];
  }
}

export async function updateWorkspace(
  workspaceSlug: string,
  data: { name: string },
) {
  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, workspaceSlug),
    });

    if (!workspace) {
      throw new Error('workspace not found');
    }

    const [updatedWorkspace] = await db
      .update(workspacesTable)
      .set({ name: data.name })
      .where(eq(workspacesTable.slug, workspaceSlug))
      .returning();

    return [null, updatedWorkspace] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function deleteWorkspace(workspaceSlug: string, userId: string) {
  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, workspaceSlug),
    });

    if (!workspace) {
      throw new Error('workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new Error('only owner can delete workspace');
    }

    const result = await db
      .delete(workspacesTable)
      .where(eq(workspacesTable.slug, workspaceSlug));

    if (result.rowCount === 0) {
      return [
        new Error('workspace not found or already deleted'),
        null,
      ] as const;
    }

    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}
