import { Request, Response } from 'express';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  deleteWorkspaceSchema,
  checkSlugAvailabilitySchema,
} from '../utils/validations/workspace';
import {
  createWorkspaceApiKeySchema,
  deleteWorkspaceApiKeySchema,
} from '../utils/validations/workspace-api-key';
import { db } from '../db';
import { workspacesTable, workspaceUsersTable, usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
  getUserWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  checkSlugExists,
  getDashboardStats,
  getDashboardHeatmap,
} from '../utils/workspace';
import {
  listWorkspaceApiKeys,
  createWorkspaceApiKey,
  deleteWorkspaceApiKey,
} from '../utils/workspace-api-key';
import {
  validationError,
  created,
  serverError,
  ok,
  notFound,
  forbidden,
} from '../utils/responses';
import {
  toDashboardStatsResponseDto,
  toDashboardHeatmapResponseDto,
} from '../dto/dashboard.dto';
import logger from '../logger';
import {
  toWorkspaceApiKeyListResponseDto,
  toWorkspaceApiKeyResponseDto,
} from '../dto/workspace-api-key.dto';

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
    const slugExists = await checkSlugExists(slug);
    if (slugExists) {
      return validationError(res, 'Workspace slug already taken', [
        {
          path: ['slug'],
          message: 'This workspace slug is already taken. Please try another.',
          code: 'custom',
        },
      ]);
    }

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

export async function checkSlugAvailabilityController(
  req: Request,
  res: Response,
) {
  const { slug } = req.params;

  const validate = checkSlugAvailabilitySchema.safeParse({ slug });

  if (!validate.success) {
    return validationError(res, 'Invalid slug', validate.error.issues);
  }

  try {
    const exists = await checkSlugExists(validate.data.slug);
    return ok(res, 'Slug availability checked', { available: !exists });
  } catch (error) {
    logger.error(error, 'Error checking slug availability');
    return serverError(res, 'Failed to check slug availability');
  }
}

export async function getDashboardStatsController(req: Request, res: Response) {
  const workspaceSlug = req.workspaceSlug!;
  const userId = req.userId!;

  const [error, dashboardData] = await getDashboardStats(workspaceSlug);

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    }
    logger.error(error, 'Error fetching dashboard stats');
    return serverError(res, 'Failed to fetch dashboard stats');
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  return ok(
    res,
    'Dashboard stats retrieved successfully',
    toDashboardStatsResponseDto({
      ...dashboardData!,
      userDisplayName: user?.name ?? '',
    }),
  );
}

export async function getDashboardHeatmapController(
  req: Request,
  res: Response,
) {
  const workspaceSlug = req.workspaceSlug!;

  const [error, heatmapData] = await getDashboardHeatmap(workspaceSlug);

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    }
    logger.error(error, 'Error fetching dashboard heatmap');
    return serverError(res, 'Failed to fetch dashboard heatmap');
  }

  return ok(
    res,
    'Dashboard heatmap retrieved successfully',
    toDashboardHeatmapResponseDto(heatmapData!),
  );
}

export async function listWorkspaceApiKeysController(
  req: Request,
  res: Response,
) {
  const workspaceId = req.workspaceId;

  if (!workspaceId) {
    return serverError(res, 'Workspace ID missing');
  }

  const [error, keys] = await listWorkspaceApiKeys(workspaceId);

  if (error || !keys) {
    logger.error(error, 'Error fetching workspace API keys');
    return serverError(res, 'Failed to fetch workspace API keys');
  }

  return ok(
    res,
    'Workspace API keys fetched successfully',
    toWorkspaceApiKeyListResponseDto(keys),
  );
}

export async function createWorkspaceApiKeyController(
  req: Request,
  res: Response,
) {
  const workspaceId = req.workspaceId;
  const workspaceSlug = req.workspaceSlug || req.params.workspaceSlug;
  const userId = req.userId;

  const validated = createWorkspaceApiKeySchema.safeParse({
    workspaceSlug: req.params.workspaceSlug,
    description: req.body?.description,
  });

  if (!validated.success) {
    return validationError(
      res,
      'Invalid request data',
      validated.error.issues,
    );
  }

  if (!workspaceId || !workspaceSlug || !userId) {
    return serverError(res, 'Workspace context missing');
  }

  const [error, result] = await createWorkspaceApiKey({
    workspaceId,
    workspaceSlug,
    description: validated.data.description,
    createdByUserId: userId,
  });

  if (error || !result) {
    if (
      (error as Error | undefined)?.message ===
      'workspace already has maximum number of API keys'
    ) {
      return validationError(res, 'API key limit reached', [
        {
          path: ['description'],
          message: 'Workspace already has 3 API keys',
          code: 'custom',
        },
      ]);
    }
    logger.error(error, 'Error creating workspace API key');
    return serverError(res, 'Failed to create workspace API key');
  }

  return created(res, 'Workspace API key created successfully', {
    apiKey: result.apiKey,
    metadata: toWorkspaceApiKeyResponseDto(result.metadata),
  });
}

export async function deleteWorkspaceApiKeyController(
  req: Request,
  res: Response,
) {
  const workspaceId = req.workspaceId;

  const validated = deleteWorkspaceApiKeySchema.safeParse({
    workspaceSlug: req.params.workspaceSlug,
    apiKeyId: req.params.apiKeyId,
  });

  if (!validated.success) {
    return validationError(
      res,
      'Invalid request data',
      validated.error.issues,
    );
  }

  if (!workspaceId) {
    return serverError(res, 'Workspace ID missing');
  }

  const [error] = await deleteWorkspaceApiKey({
    workspaceId,
    apiKeyId: validated.data.apiKeyId,
  });

  if (error) {
    if ((error as Error).message === 'api key not found') {
      return notFound(res, 'API key not found');
    }
    logger.error(error, 'Error deleting workspace API key');
    return serverError(res, 'Failed to delete workspace API key');
  }

  return ok(res, 'Workspace API key deleted successfully');
}
