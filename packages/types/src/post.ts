import { z } from 'zod';

export interface Post {
  id: string;
  workspaceId: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published';
  visible: boolean;
  createdAt: string;
  publishedAt: string | null;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    slug: string;
    name: string;
  }>;
}

export interface PostContent {
  id: string;
  postId: string;
  contentHtml: string;
  contentJson: unknown;
}

export interface PostWithContent extends Post {
  content: Pick<PostContent, 'id' | 'contentHtml' | 'contentJson'>;
}

export type CreatePostData = {
  title: string;
  slug: string;
  excerpt: string;
  authorId?: string;
  categorySlug?: string;
  tagSlugs: string[];
  status: 'draft' | 'published';
  visible: boolean;
  contentHtml: string;
  contentJson: unknown;
  publishedAt?: Date | null;
};

export type UpdatePostData = {
  title?: string;
  slug?: string;
  excerpt?: string;
  authorId?: string;
  categorySlug?: string;
  tagSlugs?: string[];
  status?: 'draft' | 'published';
  visible?: boolean;
  contentHtml?: string;
  contentJson?: unknown;
  publishedAt?: Date | null;
};

export const postStatusEnum = z.enum(['draft', 'published']);

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(255, 'Slug must be at most 255 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens',
    ),
  excerpt: z.string().trim(),
  authorId: z.string().uuid('Invalid author ID').optional(),
  categorySlug: z.string().trim().max(255).optional(),
  tagSlugs: z.array(z.string()),
  publishedAt: z
    .date({
      message: 'Published date must be a valid date',
    })
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Published date must be a valid date',
    }),
  visible: z.boolean(),
  status: postStatusEnum,
});

export const updatePostSchema = createPostSchema.extend({
  publishedAt: z
    .date({
      message: 'Published date must be a valid date',
    })
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Published date must be a valid date',
    })
    .optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
