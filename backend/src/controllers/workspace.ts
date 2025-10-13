import { Request, Response } from 'express';
import { createWorkspaceSchema } from '../utils/validations/workspace';
import { db } from '../db';
import { workspacesTable, workspaceUsersTable } from '../db/schema';
import { getUserIdbySession } from '../utils/sessions';
import { getUserWorkspaces } from '../utils/workspace';
import { validationError, created, serverError, ok } from '../utils/responses';

export async function createWorkspaceController(req: Request, res: Response) {
  const validatedBody = createWorkspaceSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }
  const { name, slug } = validatedBody.data;
  const sessionId: string = req.cookies['session_id'];

  const [, userId] = await getUserIdbySession(sessionId);

  try {
    //* wrapping operations in transaction
    const workspace = await db.transaction(async (tx) => {
      const [workspace] = await tx
        .insert(workspacesTable)
        .values({
          name: name,
          slug: slug,
        })
        .returning();

      await tx.insert(workspaceUsersTable).values({
        workspaceId: workspace.id,
        userId: userId!,
        role: 'owner',
        joinedAt: new Date(),
      });

      return workspace;
    });

    return created(res, 'Workspace created successfully', {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return serverError(res, 'Failed to create workspace');
  }
}

export async function getUserWorkspacesController(req: Request, res: Response) {
  const userId = req.userId!;

  const [userWorkspacesError, userWorkspaces] = await getUserWorkspaces(userId);

  if (userWorkspacesError || !userWorkspaces) {
    return serverError(res, 'Error while fetching user workspaces');
  }

  return ok(res, 'User workspaces fetched successfully', userWorkspaces);
}
