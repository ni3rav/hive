import { describe, it, expect } from 'vitest';
import {
  postStatusEnum,
  createPostSchema,
  updatePostSchema,
} from '../src/post';

describe('post schemas', () => {
  describe('postStatusEnum', () => {
    it('validates draft status', () => {
      const result = postStatusEnum.safeParse('draft');
      expect(result.success).toBe(true);
    });

    it('validates published status', () => {
      const result = postStatusEnum.safeParse('published');
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = postStatusEnum.safeParse('archived');
      expect(result.success).toBe(false);
    });
  });

  describe('createPostSchema', () => {
    it('validates correct post data', () => {
      const result = createPostSchema.safeParse({
        title: 'My Post',
        slug: 'my-post',
        excerpt: 'A brief description',
        tagSlugs: ['javascript', 'typescript'],
        publishedAt: new Date(),
        visible: true,
        status: 'published',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = createPostSchema.safeParse({
        title: '',
        slug: 'my-post',
        excerpt: 'A brief description',
        tagSlugs: [],
        publishedAt: new Date(),
        visible: false,
        status: 'draft',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid slug format', () => {
      const result = createPostSchema.safeParse({
        title: 'My Post',
        slug: 'My Post!',
        excerpt: 'A brief description',
        tagSlugs: [],
        publishedAt: new Date(),
        visible: false,
        status: 'draft',
      });
      expect(result.success).toBe(false);
    });

    it('allows slug with hyphens', () => {
      const result = createPostSchema.safeParse({
        title: 'My Post',
        slug: 'my-blog-post',
        excerpt: 'A brief description',
        tagSlugs: [],
        publishedAt: new Date(),
        visible: false,
        status: 'draft',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updatePostSchema', () => {
    it('validates partial update with all required fields', () => {
      const result = updatePostSchema.safeParse({
        title: 'Updated Title',
        slug: 'updated-slug',
        excerpt: 'Updated excerpt',
        tagSlugs: [],
        publishedAt: new Date(),
        visible: false,
        status: 'draft',
      });
      expect(result.success).toBe(true);
    });

    it('validates status update', () => {
      const result = updatePostSchema.safeParse({
        title: 'My Post',
        slug: 'my-post',
        excerpt: '',
        tagSlugs: [],
        publishedAt: new Date(),
        visible: false,
        status: 'published',
      });
      expect(result.success).toBe(true);
    });

    it('validates update with optional publishedAt', () => {
      const result = updatePostSchema.safeParse({
        title: 'My Post',
        slug: 'my-post',
        excerpt: '',
        tagSlugs: [],
        visible: false,
        status: 'draft',
      });
      expect(result.success).toBe(true);
    });
  });
});
