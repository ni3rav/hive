import { describe, it, expect } from 'vitest';
import {
  memberRoleEnum,
  ROLE_HIERARCHY,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../src/member';

describe('member schemas', () => {
  describe('memberRoleEnum', () => {
    it('validates owner role', () => {
      const result = memberRoleEnum.safeParse('owner');
      expect(result.success).toBe(true);
    });

    it('validates admin role', () => {
      const result = memberRoleEnum.safeParse('admin');
      expect(result.success).toBe(true);
    });

    it('validates member role', () => {
      const result = memberRoleEnum.safeParse('member');
      expect(result.success).toBe(true);
    });

    it('rejects invalid role', () => {
      const result = memberRoleEnum.safeParse('guest');
      expect(result.success).toBe(false);
    });
  });

  describe('ROLE_HIERARCHY', () => {
    it('has correct hierarchy values', () => {
      expect(ROLE_HIERARCHY.owner).toBe(3);
      expect(ROLE_HIERARCHY.admin).toBe(2);
      expect(ROLE_HIERARCHY.member).toBe(1);
    });
  });

  describe('inviteMemberSchema', () => {
    it('validates correct invite data', () => {
      const result = inviteMemberSchema.safeParse({
        email: 'invite@example.com',
        role: 'member',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = inviteMemberSchema.safeParse({
        email: 'not-an-email',
        role: 'member',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid role', () => {
      const result = inviteMemberSchema.safeParse({
        email: 'invite@example.com',
        role: 'guest',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateMemberRoleSchema', () => {
    it('validates correct role update', () => {
      const result = updateMemberRoleSchema.safeParse({
        role: 'admin',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid role', () => {
      const result = updateMemberRoleSchema.safeParse({
        role: 'superadmin',
      });
      expect(result.success).toBe(false);
    });
  });
});
