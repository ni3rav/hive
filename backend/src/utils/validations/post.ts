import { z } from 'zod';

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'title is required')
    .max(255, 'title must be at most 255 characters'),
  slug: z
    .string()
    .trim()
    .min(1, 'slug is required')
    .max(255, 'slug must be at most 255 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'slug must be lowercase alphanumeric with hyphens',
    ),
  excerpt: z.string().trim().default(''),
  authorId: z.uuid('invalid author id').optional(),
  categorySlug: z
    .string()
    .trim()
    .max(255, 'category slug must be at most 255 characters')
    .optional(),
  tagSlugs: z.array(z.string().trim()).default([]),
  status: z
    .enum(['draft', 'published'], {
      message: 'status must be draft or published',
    })
    .default('draft'),
  visible: z.boolean().default(false),
  contentHtml: z.string().min(1, 'content html is required'),
  contentJson: z.unknown().refine((val) => val !== null && val !== undefined, {
    message: 'content json is required',
  }),
  publishedAt: z.coerce.date().optional(),
});

export const updatePostSchema = z.object({
  postId: z.uuid('invalid post id'),
  data: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, 'title is required')
        .max(255, 'title must be at most 255 characters')
        .optional(),
      slug: z
        .string()
        .trim()
        .min(1, 'slug is required')
        .max(255, 'slug must be at most 255 characters')
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'slug must be lowercase alphanumeric with hyphens',
        )
        .optional(),
      excerpt: z.string().trim().optional(),
      authorId: z.uuid('invalid author id').optional(),
      categorySlug: z
        .string()
        .trim()
        .max(255, 'category slug must be at most 255 characters')
        .optional(),
      tagSlugs: z.array(z.string().trim()).optional(),
      status: z
        .enum(['draft', 'published'], {
          message: 'status must be draft or published',
        })
        .optional(),
      visible: z.boolean().optional(),
      contentHtml: z.string().min(1, 'content html is required').optional(),
      contentJson: z.unknown().optional(),
      publishedAt: z.coerce.date().optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: 'please provide at least one field to update' },
    ),
});

export const getPostSchema = z.object({
  postId: z.uuid('invalid post id'),
});

export const deletePostSchema = z.object({
  postId: z.uuid('invalid post id'),
});
