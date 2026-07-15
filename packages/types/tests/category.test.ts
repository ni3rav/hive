import { describe, it, expect } from 'vitest';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../src/category';

describe('category schemas', () => {
  describe('createCategorySchema', () => {
    it('validates correct category data', () => {
      const result = createCategorySchema.safeParse({
        name: 'Technology',
        slug: 'technology',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = createCategorySchema.safeParse({
        name: '',
        slug: 'technology',
      });
      expect(result.success).toBe(false);
    });

    it('rejects slug with invalid characters', () => {
      const result = createCategorySchema.safeParse({
        name: 'Technology',
        slug: 'tech nology!',
      });
      expect(result.success).toBe(false);
    });

    it('allows slug with hyphens', () => {
      const result = createCategorySchema.safeParse({
        name: 'Web Development',
        slug: 'web-development',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateCategorySchema', () => {
    it('validates partial update', () => {
      const result = updateCategorySchema.safeParse({
        name: 'Updated Name',
      });
      expect(result.success).toBe(true);
    });

    it('validates empty update', () => {
      const result = updateCategorySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('validates slug update', () => {
      const result = updateCategorySchema.safeParse({
        slug: 'new-slug',
      });
      expect(result.success).toBe(true);
    });
  });
});
