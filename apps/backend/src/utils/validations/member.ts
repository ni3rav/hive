import { z } from 'zod';

export const memberRoleEnum = z.enum(['owner', 'admin', 'member']);

export const inviteMemberSchema = z.object({
  email: z.email(),
  role: memberRoleEnum,
});

export const updateMemberRoleSchema = z.object({
  role: memberRoleEnum,
});

export const revokeInvitationSchema = z.object({
  invitationId: z.uuid(),
});

export const memberIdParamSchema = z.object({
  userId: z.uuid(),
});

export const invitationTokenSchema = z.object({
  token: z.string().uuid(),
});
