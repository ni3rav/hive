import { z } from 'zod';

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
    .max(255, 'Slug must be at most 255 characters'),
});

export const updateCategorySchema = z.object({
  categorySlug: z.string().trim().min(1, 'Category slug is required'),
  data: z
    .object({
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
        .max(255, 'Slug must be at most 255 characters')
        .optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: 'Please provide at least one field to update' },
    ),
});

export const deleteCategorySchema = z.object({
  categorySlug: z.string().trim().min(1, 'Category slug is required'),
});

export const getCategoryBySlugSchema = z.object({
  categorySlug: z.string().trim().min(1, 'Category slug is required'),
});
