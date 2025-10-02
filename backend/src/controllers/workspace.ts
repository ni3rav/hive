import { Request, Response } from 'express';
import { getUserIdbySession } from '../utils/sessions';
import { createWorkspaceSchema } from '../utils/validations/workspace';
import { db } from '../db';
import { workspacesTable, workspaceUsersTable } from '../db/schema';
import {
  validationError,
  unauthorized,
  created,
  serverError,
} from '../utils/responses';

export async function createWorkspaceController(req: Request, res: Response) {
  const sessionId = req.cookies['session_id'];

  if (!sessionId) {
    return unauthorized(res, 'No active session');
  }

  const [sessionError, userId] = await getUserIdbySession(sessionId);

  if (sessionError) {
    return unauthorized(res, 'Invalid or expired session');
  }

  if (!userId) {
    return unauthorized(res, 'Invalid or expired session');
  }

  const validatedBody = createWorkspaceSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }
  const { name, slug } = validatedBody.data;

  try {
    const [workspace] = await db
      .insert(workspacesTable)
      .values({
        name: name,
        slug: slug,
      })
      .returning();

    await db.insert(workspaceUsersTable).values({
      workspaceId: workspace.id,
      userId: userId,
      role: 'owner',
      joinedAt: new Date(),
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
