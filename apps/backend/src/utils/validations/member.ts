import { z } from 'zod';
import {
  memberRoleEnum,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '@hive/types';

export { memberRoleEnum, inviteMemberSchema, updateMemberRoleSchema };

export type { MemberRole, InviteMemberData, UpdateMemberRoleData } from '@hive/types';

export const revokeInvitationSchema = z.object({
  invitationId: z.uuid(),
});

export const memberIdParamSchema = z.object({
  userId: z.uuid(),
});

export const invitationTokenSchema = z.object({
  token: z.string().uuid(),
});
