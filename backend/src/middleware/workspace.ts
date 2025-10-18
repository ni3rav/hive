import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { workspacesTable, workspaceUsersTable } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { unauthorized, notFound } from '../utils/responses';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    workspaceId?: string;
    workspaceSlug?: string;
  }
}

export async function verifyWorkspaceMembership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const workspaceSlug = req.params.workspaceSlug;
    const userId = req.userId;

    if (!workspaceSlug) {
      return res.status(400).json({
        success: false,
        message: 'Workspace slug is required',
        code: 'MISSING_WORKSPACE_SLUG',
      });
    }

    if (!userId) {
      return unauthorized(res, 'Authentication required');
    }

    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, workspaceSlug),
    });

    if (!workspace) {
      return notFound(res, 'Workspace not found');
    }

    const membership = await db.query.workspaceUsersTable.findFirst({
      where: and(
        eq(workspaceUsersTable.workspaceId, workspace.id),
        eq(workspaceUsersTable.userId, userId),
      ),
    });

    if (!membership) {
      return unauthorized(res, 'You are not a member of this workspace');
    }

    req.workspaceId = workspace.id;
    req.workspaceSlug = workspace.slug;

    next();
  } catch (error) {
    console.error('Error verifying workspace membership:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
