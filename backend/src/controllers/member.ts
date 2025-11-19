import { Request, Response } from 'express';
import {
  getPendingInvitations,
  getWorkspaceMembers,
  inviteMember,
  leaveWorkspace,
  removeMember,
  revokeInvitation,
  updateMemberRole,
} from '../utils/member';
import {
  inviteMemberSchema,
  memberIdParamSchema,
  revokeInvitationSchema,
  updateMemberRoleSchema,
} from '../utils/validations/member';
import {
  ok,
  created,
  validationError,
  serverError,
  forbidden,
  notFound,
  conflict,
} from '../utils/responses';
import {
  toInvitationListResponse,
  toMemberListResponse,
  toMemberResponse,
} from '../dto/member.dto';
import { sendEmail } from '../utils/email';
import {
  workspaceInvitationEmail,
  WORKSPACE_INVITATION_EMAIL_FROM,
} from '../templates';
import { db } from '../db';
import { workspacesTable, usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { env } from '../env';
import logger from '../logger';

export async function listWorkspaceMembersController(
  req: Request,
  res: Response,
) {
  const workspaceId = req.workspaceId!;
  try {
    const [mErr, members] = await getWorkspaceMembers(workspaceId);
    if (mErr || !members) {
      return serverError(res, 'Failed to load members');
    }
    const [iErr, invitations] = await getPendingInvitations(workspaceId);
    if (iErr || !invitations) {
      return serverError(res, 'Failed to load invitations');
    }
    return ok(res, 'Members loaded', {
      members: toMemberListResponse(
        members.map((m) => ({
          user: m.user!,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
      ),
      invitations: toInvitationListResponse(invitations),
    });
  } catch (_e) {
    logger.error(_e, 'Error loading members');
    return serverError(res, 'Failed to load members');
  }
}

export async function inviteMemberController(req: Request, res: Response) {
  const parse = inviteMemberSchema.safeParse(req.body);
  if (!parse.success) {
    return validationError(res, 'Invalid request data', parse.error.issues);
  }
  const { email, role } = parse.data;
  const workspaceId = req.workspaceId!;
  const invitedBy = req.userId!;
  try {
    const [err, invitation] = await inviteMember(
      workspaceId,
      invitedBy,
      email,
      role,
    );
    if (err) {
      const msg = (err as Error).message;
      if (msg === 'inviter not a member') return forbidden(res, 'Not a member');
      if (msg === 'insufficient role to assign')
        return forbidden(res, 'Insufficient role to assign');
      if (msg === 'user not found') return notFound(res, 'User not found');
      if (msg === 'user already a member')
        return conflict(res, 'User is already a member');
      if (msg === 'user not verified')
        return conflict(res, 'User exists but email not verified');
      return serverError(res, 'Failed to create invitation');
    }

    if (invitation) {
      const [workspace, inviter] = await Promise.all([
        db.query.workspacesTable.findFirst({
          where: eq(workspacesTable.id, workspaceId),
        }),
        db.query.usersTable.findFirst({
          where: eq(usersTable.id, invitedBy),
        }),
      ]);

      if (workspace && inviter) {
        const invitationLink = `${env.FRONTEND_URL}/accept-invite?token=${invitation.token}`;
        const emailHtml = workspaceInvitationEmail({
          workspaceName: workspace.name,
          inviterName: inviter.name || inviter.email,
          inviterEmail: inviter.email,
          role: role,
          invitationLink: invitationLink,
        });

        await sendEmail({
          to: email,
          subject: `You've been invited to join ${workspace.name}`,
          html: emailHtml,
          from: WORKSPACE_INVITATION_EMAIL_FROM,
        });
      }
    }

    return created(
      res,
      'Invitation created',
      invitation && { id: invitation.id },
    );
  } catch (_e) {
    logger.error(_e, 'Error creating invitation');
    return serverError(res, 'Failed to create invitation');
  }
}

export async function updateMemberRoleController(req: Request, res: Response) {
  const paramParse = memberIdParamSchema.safeParse({
    userId: req.params.userId,
  });
  if (!paramParse.success) {
    return validationError(res, 'Invalid user id', paramParse.error.issues);
  }
  const bodyParse = updateMemberRoleSchema.safeParse(req.body);
  if (!bodyParse.success) {
    return validationError(res, 'Invalid request data', bodyParse.error.issues);
  }
  const workspaceId = req.workspaceId!;
  const actingUserId = req.userId!;
  const targetUserId = paramParse.data.userId;
  const newRole = bodyParse.data.role;
  try {
    const [err, updated] = await updateMemberRole(
      workspaceId,
      actingUserId,
      targetUserId,
      newRole,
    );
    if (err || !updated) {
      const msg = (err as Error).message;
      if (msg === 'cannot change own role')
        return forbidden(res, 'Cannot change own role');
      if (msg === 'membership not found')
        return notFound(res, 'Member not found');
      if (msg === 'insufficient role to manage target')
        return forbidden(res, 'Insufficient role to manage target');
      if (msg === 'insufficient role to assign')
        return forbidden(res, 'Insufficient role to assign');
      if (msg === 'cannot demote the last owner')
        return conflict(res, 'Cannot demote the last owner');
      return serverError(res, 'Failed to update role');
    }
    return ok(
      res,
      'Member role updated',
      toMemberResponse({
        user: await (async () => {
          return { id: targetUserId, name: '', email: '', avatar: null };
        })(),
        role: updated.role,
        joinedAt: updated.joinedAt,
      }),
    );
  } catch (_e) {
    logger.error(_e, 'Error updating role');
    return serverError(res, 'Failed to update role');
  }
}

export async function removeMemberController(req: Request, res: Response) {
  const paramParse = memberIdParamSchema.safeParse({
    userId: req.params.userId,
  });
  if (!paramParse.success) {
    return validationError(res, 'Invalid user id', paramParse.error.issues);
  }
  const workspaceId = req.workspaceId!;
  const actingUserId = req.userId!;
  const targetUserId = paramParse.data.userId;
  try {
    const [err] = await removeMember(workspaceId, actingUserId, targetUserId);
    if (err) {
      const msg = (err as Error).message;
      if (msg === 'cannot remove self')
        return forbidden(res, 'Cannot remove self');
      if (msg === 'membership not found')
        return notFound(res, 'Member not found');
      if (msg === 'insufficient role to remove target')
        return forbidden(res, 'Insufficient role to remove target');
      if (msg === 'cannot remove the last owner')
        return conflict(res, 'Cannot remove the last owner');
      return serverError(res, 'Failed to remove member');
    }
    return ok(res, 'Member removed');
  } catch (_e) {
    logger.error(_e, 'Error removing member');
    return serverError(res, 'Failed to remove member');
  }
}

export async function revokeInvitationController(req: Request, res: Response) {
  const parse = revokeInvitationSchema.safeParse({
    invitationId: req.params.invitationId,
  });
  if (!parse.success) {
    return validationError(res, 'Invalid invitation id', parse.error.issues);
  }
  const workspaceId = req.workspaceId!;
  const actingUserId = req.userId!;
  try {
    const [err] = await revokeInvitation(
      workspaceId,
      actingUserId,
      parse.data.invitationId,
    );
    if (err) {
      const msg = (err as Error).message;
      if (msg === 'invoker not a member') return forbidden(res, 'Not a member');
      if (msg === 'invitation not found')
        return notFound(res, 'Invitation not found');
      if (msg === 'invitation not pending')
        return conflict(res, 'Invitation is not pending');
      if (msg === 'insufficient role to revoke invitation')
        return forbidden(res, 'Insufficient role to revoke invitation');
      return serverError(res, 'Failed to revoke invitation');
    }
    return ok(res, 'Invitation revoked');
  } catch (_e) {
    logger.error(_e, 'Error revoking invitation');
    return serverError(res, 'Failed to revoke invitation');
  }
}

export async function leaveWorkspaceController(req: Request, res: Response) {
  const workspaceSlug = req.workspaceSlug!;
  const userId = req.userId!;
  try {
    const [err] = await leaveWorkspace(workspaceSlug, userId);
    if (err) {
      const msg = (err as Error).message;
      if (msg === 'workspace not found')
        return notFound(res, 'Workspace not found');
      if (msg === 'not a member') return forbidden(res, 'Not a member');
      if (msg === 'owner cannot leave as the last owner')
        return conflict(res, 'Owner cannot leave as the last owner');
      return serverError(res, 'Failed to leave workspace');
    }
    return ok(res, 'Left workspace');
  } catch (_e) {
    logger.error(_e, 'Error leaving workspace');
    return serverError(res, 'Failed to leave workspace');
  }
}
