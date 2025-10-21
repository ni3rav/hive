import { Request, Response } from 'express';
import { createWorkspaceSchema } from '../utils/validations/workspace';
import { db } from '../db';
import { workspacesTable, workspaceUsersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getUserWorkspaces } from '../utils/workspace';
import { validationError, created, serverError, ok } from '../utils/responses';

export async function createWorkspaceController(req: Request, res: Response) {
  const { workspaceName, workspaceSlug } = req.body;
  const validatedBody = createWorkspaceSchema.safeParse({
    name: workspaceName,
    slug: workspaceSlug,
  });

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }
  const { name, slug } = validatedBody.data;
  const userId = req.userId!;

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

export async function verifyWorkspaceAccessController(
  req: Request,
  res: Response,
) {
  const workspaceId = req.workspaceId;
  const workspaceRole = req.workspaceRole;

  if (!workspaceId) {
    return serverError(res, 'Workspace ID missing');
  }

  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.id, workspaceId),
    });

    if (!workspace) {
      return serverError(res, 'Workspace not found');
    }

    return ok(res, 'Workspace access verified', {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      createdAt: workspace.createdAt,
      role: workspaceRole,
    });
  } catch (error) {
    console.error('Error verifying workspace access:', error);
    return serverError(res, 'Failed to verify workspace access');
  }
}
