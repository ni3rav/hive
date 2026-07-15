import { describe, it, expect } from 'vitest';
import {
  createAuthorSchema,
  updateAuthorSchema,
} from '../src/author';

describe('author schemas', () => {
  describe('createAuthorSchema', () => {
    it('validates correct author data', () => {
      const result = createAuthorSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('validates with optional fields', () => {
      const result = createAuthorSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        about: 'A great author',
        socialLinks: { twitter: 'https://twitter.com/johndoe' },
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = createAuthorSchema.safeParse({
        name: 'John Doe',
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid URL in social links', () => {
      const result = createAuthorSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        socialLinks: { twitter: 'not-a-url' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateAuthorSchema', () => {
    it('validates partial update', () => {
      const result = updateAuthorSchema.safeParse({
        name: 'Jane Doe',
      });
      expect(result.success).toBe(true);
    });

    it('validates empty update', () => {
      const result = updateAuthorSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('validates email update', () => {
      const result = updateAuthorSchema.safeParse({
        email: 'new@example.com',
      });
      expect(result.success).toBe(true);
    });
  });
});
