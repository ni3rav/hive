import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  editProfileSchema,
} from '../src/auth';

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '1234567',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = registerSchema.safeParse({
        name: '',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('trims whitespace from name', () => {
      const result = registerSchema.safeParse({
        name: '  John Doe  ',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
      }
    });
  });

  describe('verifyEmailSchema', () => {
    it('validates correct verification data', () => {
      const result = verifyEmailSchema.safeParse({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        token: 'abc123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID', () => {
      const result = verifyEmailSchema.safeParse({
        userId: 'not-a-uuid',
        token: 'abc123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('validates correct email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('validates correct reset data', () => {
      const result = resetPasswordSchema.safeParse({
        email: 'test@example.com',
        token: 'abc123',
        password: 'newpassword123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short password', () => {
      const result = resetPasswordSchema.safeParse({
        email: 'test@example.com',
        token: 'abc123',
        password: '1234567',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('editProfileSchema', () => {
    it('validates name only', () => {
      const result = editProfileSchema.safeParse({
        name: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('validates email only', () => {
      const result = editProfileSchema.safeParse({
        email: 'john@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('validates both name and email', () => {
      const result = editProfileSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty object', () => {
      const result = editProfileSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
