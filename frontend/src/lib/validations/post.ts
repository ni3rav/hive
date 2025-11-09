import { z } from 'zod';

export const postMetadataSchema = z.object({
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
      required_error: 'Published date is required',
      invalid_type_error: 'Published date must be a valid date',
    })
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Published date must be a valid date',
    }),
  visible: z.boolean(),
  status: z.enum(['draft', 'published']),
});

export const postMetadataUpdateSchema = postMetadataSchema.extend({
  publishedAt: z
    .date({
      invalid_type_error: 'Published date must be a valid date',
    })
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Published date must be a valid date',
    })
    .optional(),
});

export type PostMetadataFormData = z.infer<typeof postMetadataSchema>;
