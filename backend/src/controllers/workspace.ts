import { Request, Response } from 'express';
import { getUserIdbySession } from '../utils/sessions';
import { createWorkspaceSchema } from '../utils/validations/workspace';
import { db } from '../db';
import { workspacesTable, workspaceUsersTable } from '../db/schema';

export async function createWorkspaceController(req: Request, res: Response) {
  const sessionId = req.cookies['session_id'];

  if (!sessionId) {
    res.status(400).json({ message: 'session id is required' });
    return;
  }

  const [sessionError, userId] = await getUserIdbySession(sessionId);

  if (sessionError) {
    res
      .status(500)
      .json({ message: 'internal server error while fetching user id' });
    return;
  }

  if (!userId) {
    res.status(404).json({ message: 'no user id found for this session' });
    return;
  }

  const validatedBody = createWorkspaceSchema.safeParse(req.body);

  if (!validatedBody.success) {
    res.status(400).json({
      message: 'invalid data for creating workspace',
      issues: validatedBody.error.issues,
    });
    return;
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

    res.status(200).json({
      message: 'workspace created successfully',
      name: workspace.name,
      slug: workspace.slug,
    });
    return;
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: 'internal server error' });
    return;
  }
}
