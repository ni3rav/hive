import { db } from '../db';
import {
  usersTable,
  workspaceInvitationsTable,
  workspaceUsersTable,
  workspacesTable,
} from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { canAssign, canManage, MemberRole } from './roles';

export async function getWorkspaceMembers(workspaceId: string) {
  try {
    const members = await db.query.workspaceUsersTable.findMany({
      where: eq(workspaceUsersTable.workspaceId, workspaceId),
      with: { user: true },
    });
    return [null, members] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function getPendingInvitations(workspaceId: string) {
  try {
    const invitations = await db.query.workspaceInvitationsTable.findMany({
      where: and(
        eq(workspaceInvitationsTable.workspaceId, workspaceId),
        eq(workspaceInvitationsTable.status, 'pending'),
      ),
    });
    return [null, invitations] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function inviteMember(
  workspaceId: string,
  invitedByUserId: string,
  email: string,
  role: MemberRole,
) {
  try {
    const inviter = await db.query.workspaceUsersTable.findFirst({
      where: and(
        eq(workspaceUsersTable.workspaceId, workspaceId),
        eq(workspaceUsersTable.userId, invitedByUserId),
      ),
    });
    if (!inviter) {
      throw new Error('inviter not a member');
    }
    if (!canAssign(inviter.role as MemberRole, role)) {
      throw new Error('insufficient role to assign');
    }

    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (!existingUser) {
      throw new Error('user not found');
    }

    if (!existingUser.emailVerified) {
      throw new Error('user not verified');
    }

    const existingMembership = await db.query.workspaceUsersTable.findFirst({
      where: and(
        eq(workspaceUsersTable.workspaceId, workspaceId),
        eq(workspaceUsersTable.userId, existingUser.id),
      ),
    });
    if (existingMembership) {
      throw new Error('user already a member');
    }

    const pendingInvite = await db.query.workspaceInvitationsTable.findFirst({
      where: and(
        eq(workspaceInvitationsTable.workspaceId, workspaceId),
        eq(workspaceInvitationsTable.email, email),
        eq(workspaceInvitationsTable.status, 'pending'),
      ),
    });
    if (pendingInvite) {
      return [null, pendingInvite] as const;
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invitation] = await db
      .insert(workspaceInvitationsTable)
      .values({
        workspaceId,
        email,
        role,
        invitedBy: invitedByUserId,
        token,
        status: 'pending',
        expiresAt,
      })
      .returning();

    return [null, invitation] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function updateMemberRole(
  workspaceId: string,
  actingUserId: string,
  targetUserId: string,
  newRole: MemberRole,
) {
  try {
    if (actingUserId === targetUserId) {
      throw new Error('cannot change own role');
    }

    const [acting, target] = await Promise.all([
      db.query.workspaceUsersTable.findFirst({
        where: and(
          eq(workspaceUsersTable.workspaceId, workspaceId),
          eq(workspaceUsersTable.userId, actingUserId),
        ),
      }),
      db.query.workspaceUsersTable.findFirst({
        where: and(
          eq(workspaceUsersTable.workspaceId, workspaceId),
          eq(workspaceUsersTable.userId, targetUserId),
        ),
      }),
    ]);

    if (!acting || !target) {
      throw new Error('membership not found');
    }

    const actingRole = acting.role as MemberRole;
    const targetRole = target.role as MemberRole;

    if (!canManage(actingRole, targetRole)) {
      throw new Error('insufficient role to manage target');
    }
    if (!canAssign(actingRole, newRole)) {
      throw new Error('insufficient role to assign');
    }

    if (targetRole === 'owner' && newRole !== 'owner') {
      const owners = await db.query.workspaceUsersTable.findMany({
        where: and(
          eq(workspaceUsersTable.workspaceId, workspaceId),
          eq(workspaceUsersTable.role, 'owner'),
        ),
      });
      if (owners.length <= 1) {
        throw new Error('cannot demote the last owner');
      }
    }

    const [updated] = await db
      .update(workspaceUsersTable)
      .set({ role: newRole })
      .where(
        and(
          eq(workspaceUsersTable.workspaceId, workspaceId),
          eq(workspaceUsersTable.userId, targetUserId),
        ),
      )
      .returning();

    return [null, updated] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function removeMember(
  workspaceId: string,
  actingUserId: string,
  targetUserId: string,
) {
  try {
    if (actingUserId === targetUserId) {
      throw new Error('cannot remove self');
    }

    const [acting, target] = await Promise.all([
      db.query.workspaceUsersTable.findFirst({
        where: and(
          eq(workspaceUsersTable.workspaceId, workspaceId),
          eq(workspaceUsersTable.userId, actingUserId),
        ),
      }),
      db.query.workspaceUsersTable.findFirst({
        where: and(
          eq(workspaceUsersTable.workspaceId, workspaceId),
          eq(workspaceUsersTable.userId, targetUserId),
        ),
      }),
    ]);

    if (!acting || !target) {
      throw new Error('membership not found');
    }

    const actingRole = acting.role as MemberRole;
    const targetRole = target.role as MemberRole;

    if (!canManage(actingRole, targetRole)) {
      throw new Error('insufficient role to remove target');
    }

    if (targetRole === 'owner') {
      const owners = await db.query.workspaceUsersTable.findMany({
        where: and(
          eq(workspaceUsersTable.workspaceId, workspaceId),
          eq(workspaceUsersTable.role, 'owner'),
        ),
      });
      if (owners.length <= 1) {
        throw new Error('cannot remove the last owner');
      }
    }

    const result = await db
      .delete(workspaceUsersTable)
      .where(
        and(
          eq(workspaceUsersTable.workspaceId, workspaceId),
          eq(workspaceUsersTable.userId, targetUserId),
        ),
      );

    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function revokeInvitation(
  workspaceId: string,
  actingUserId: string,
  invitationId: string,
) {
  try {
    const acting = await db.query.workspaceUsersTable.findFirst({
      where: and(
        eq(workspaceUsersTable.workspaceId, workspaceId),
        eq(workspaceUsersTable.userId, actingUserId),
      ),
    });
    if (!acting) {
      throw new Error('invoker not a member');
    }

    const invitation = await db.query.workspaceInvitationsTable.findFirst({
      where: and(
        eq(workspaceInvitationsTable.workspaceId, workspaceId),
        eq(workspaceInvitationsTable.id, invitationId),
      ),
    });
    if (!invitation) {
      throw new Error('invitation not found');
    }
    if (invitation.status !== 'pending') {
      throw new Error('invitation not pending');
    }

    if (!canManage(acting.role as MemberRole, invitation.role as MemberRole)) {
      throw new Error('insufficient role to revoke invitation');
    }

    const [updated] = await db
      .update(workspaceInvitationsTable)
      .set({ status: 'revoked' })
      .where(eq(workspaceInvitationsTable.id, invitation.id))
      .returning();

    return [null, updated] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function leaveWorkspace(workspaceSlug: string, userId: string) {
  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, workspaceSlug),
    });
    if (!workspace) {
      throw new Error('workspace not found');
    }
    const membership = await db.query.workspaceUsersTable.findFirst({
      where: and(
        eq(workspaceUsersTable.workspaceId, workspace.id),
        eq(workspaceUsersTable.userId, userId),
      ),
    });
    if (!membership) {
      throw new Error('not a member');
    }
    const role = membership.role as MemberRole;
    if (role === 'owner') {
      const owners = await db.query.workspaceUsersTable.findMany({
        where: and(
          eq(workspaceUsersTable.workspaceId, workspace.id),
          eq(workspaceUsersTable.role, 'owner'),
        ),
      });
      if (owners.length <= 1) {
        throw new Error('owner cannot leave as the last owner');
      }
    }

    const result = await db
      .delete(workspaceUsersTable)
      .where(
        and(
          eq(workspaceUsersTable.workspaceId, workspace.id),
          eq(workspaceUsersTable.userId, userId),
        ),
      );
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}
