export type MemberRole = 'owner' | 'admin' | 'member';

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export interface Member {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  joinedAt: string;
}

export interface PendingInvitation {
  id: string;
  email: string;
  role: MemberRole;
  invitedAt: string;
}

export interface InviteMemberData {
  email: string;
  role: MemberRole;
}

export interface UpdateMemberRoleData {
  role: MemberRole;
}

