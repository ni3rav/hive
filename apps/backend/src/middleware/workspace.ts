import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { workspacesTable, workspaceUsersTable } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { unauthorized, notFound, serverError } from '../utils/responses';
import { MemberRole } from '../utils/roles';
import logger from '../logger';

declare module 'express-serve-static-core' {
  interface Request {
    workspaceId?: string;
    workspaceSlug?: string;
    workspaceRole?: MemberRole;
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
    req.workspaceRole = membership.role as MemberRole;
    next();
  } catch (error) {
    logger.error(error, 'Error verifying workspace membership');
    return serverError(res, 'Internal server error');
  }
}
