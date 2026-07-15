import { describe, it, expect } from 'vitest';
import {
  createTagSchema,
  updateTagSchema,
} from '../src/tag';

describe('tag schemas', () => {
  describe('createTagSchema', () => {
    it('validates correct tag data', () => {
      const result = createTagSchema.safeParse({
        name: 'JavaScript',
        slug: 'javascript',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = createTagSchema.safeParse({
        name: '',
        slug: 'javascript',
      });
      expect(result.success).toBe(false);
    });

    it('rejects slug with invalid characters', () => {
      const result = createTagSchema.safeParse({
        name: 'JavaScript',
        slug: 'java script!',
      });
      expect(result.success).toBe(false);
    });

    it('allows slug with hyphens', () => {
      const result = createTagSchema.safeParse({
        name: 'Web Development',
        slug: 'web-development',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateTagSchema', () => {
    it('validates partial update', () => {
      const result = updateTagSchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('validates empty update', () => {
      const result = updateTagSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('validates slug update', () => {
      const result = updateTagSchema.safeParse({
        slug: 'new-slug',
      });
      expect(result.success).toBe(true);
    });
  });
});
