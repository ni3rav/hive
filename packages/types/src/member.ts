import { z } from 'zod';

export const memberRoleEnum = z.enum(['owner', 'admin', 'member']);

export type MemberRole = z.infer<typeof memberRoleEnum>;

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

export const inviteMemberSchema = z.object({
  email: z.email('Invalid email'),
  role: memberRoleEnum,
});

export const updateMemberRoleSchema = z.object({
  role: memberRoleEnum,
});

export type InviteMemberData = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleData = z.infer<typeof updateMemberRoleSchema>;
