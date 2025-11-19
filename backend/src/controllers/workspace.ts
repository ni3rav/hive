import { Request, Response } from 'express';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  deleteWorkspaceSchema,
} from '../utils/validations/workspace';
import { db } from '../db';
import { workspacesTable, workspaceUsersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
  getUserWorkspaces,
  updateWorkspace,
  deleteWorkspace,
} from '../utils/workspace';
import {
  validationError,
  created,
  serverError,
  ok,
  notFound,
  forbidden,
} from '../utils/responses';
import logger from '../logger';

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
          ownerId: userId,
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
    logger.error(error, 'Error creating workspace');
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
    logger.error(error, 'Error verifying workspace access');
    return serverError(res, 'Failed to verify workspace access');
  }
}

export async function updateWorkspaceController(req: Request, res: Response) {
  const workspaceSlug = req.params.workspaceSlug;
  const data = req.body;

  const validate = updateWorkspaceSchema.safeParse({
    workspaceSlug,
    data,
  });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const [error, workspace] = await updateWorkspace(
    validate.data.workspaceSlug,
    validate.data.data,
  );

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    }
    logger.error(error, 'Error updating workspace');
    return serverError(res, 'Failed to update workspace');
  }

  return ok(res, 'Workspace updated successfully', {
    id: workspace!.id,
    name: workspace!.name,
    slug: workspace!.slug,
    createdAt: workspace!.createdAt,
  });
}

export async function deleteWorkspaceController(req: Request, res: Response) {
  const workspaceSlug = req.params.workspaceSlug;
  const userId = req.userId!;

  const validate = deleteWorkspaceSchema.safeParse({ workspaceSlug });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const [error] = await deleteWorkspace(validate.data.workspaceSlug, userId);

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    } else if ((error as Error).message === 'only owner can delete workspace') {
      return forbidden(res, 'Only workspace owner can delete the workspace');
    } else if (
      (error as Error).message === 'workspace not found or already deleted'
    ) {
      return notFound(res, 'Workspace not found');
    }
    logger.error(error, 'Error deleting workspace');
    return serverError(res, 'Failed to delete workspace');
  }

  return ok(res, 'Workspace deleted successfully');
}
