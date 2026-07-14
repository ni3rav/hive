import z from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(3).max(30).trim(),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters')
    .max(35, 'Slug must be at most 35 characters')
    .regex(
      /^[a-z0-9]+([a-z0-9-]*[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.',
    )
    .refine((slug) => !slug.includes('--'), {
      message: 'Slug cannot contain consecutive hyphens',
    }),
});

export const updateWorkspaceSchema = z.object({
  workspaceSlug: z.string().trim().min(1, 'Workspace slug is required'),
  data: z.object({
    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(30, 'Name must be at most 30 characters'),
  }),
});

export const deleteWorkspaceSchema = z.object({
  workspaceSlug: z.string().trim().min(1, 'Workspace slug is required'),
});

export const checkSlugAvailabilitySchema = z.object({
  slug: z.string().trim().min(1, 'Slug is required'),
});
