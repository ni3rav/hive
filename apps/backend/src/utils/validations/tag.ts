import { z } from 'zod';

export const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(30, 'Name must be at most 30 characters'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be at most 50 characters'),
});

export const updateTagSchema = z.object({
  tagSlug: z.string().trim().min(1, 'Tag slug is required'),
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
        .max(50, 'Slug must be at most 50 characters')
        .optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: 'Please provide at least one field to update' },
    ),
});

export const deleteTagSchema = z.object({
  tagSlug: z.string().trim().min(1, 'Tag slug is required'),
});
