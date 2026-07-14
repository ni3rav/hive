import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['owner', 'admin', 'member']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'member']),
});

