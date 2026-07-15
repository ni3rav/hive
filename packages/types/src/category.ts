import { z } from 'zod';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type CreateCategoryData = Pick<Category, 'name' | 'slug'>;

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(30, 'Name must be at most 30 characters'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be at most 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens',
    ),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(30, 'Name must be at most 30 characters')
    .optional(),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be at most 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens',
    )
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
