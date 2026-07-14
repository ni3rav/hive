import type { WorkspaceInvitation } from '../types/workspaces';

export type MemberJoined = {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  role: string;
  joinedAt: Date;
};

export function toMemberResponse(member: MemberJoined) {
  return {
    userId: member.user.id,
    name: member.user.name,
    email: member.user.email,
    avatar: member.user.avatar ?? undefined,
    role: member.role as 'owner' | 'admin' | 'member',
    joinedAt: member.joinedAt.toISOString(),
  };
}

export function toMemberListResponse(members: MemberJoined[]) {
  return members.map(toMemberResponse);
}

export function toInvitationResponse(inv: WorkspaceInvitation) {
  return {
    id: inv.id,
    email: inv.email,
    role: inv.role as 'owner' | 'admin' | 'member',
    invitedAt: inv.invitedAt.toISOString(),
  };
}

export function toInvitationListResponse(invitations: WorkspaceInvitation[]) {
  return invitations.map(toInvitationResponse);
}
