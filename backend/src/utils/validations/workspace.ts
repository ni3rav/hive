import z from 'zod';

export const createWorkspaceSchema = z
  .object({
    name: z.string().min(3).max(30).trim(),
    slug: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    const { name, slug } = data;
    if (!name) {
      ctx.addIssue({
        path: ['slug'],
        code: 'custom',
        message: `Slug must be in the format "<name>-<4 alphanumeric characters>"`,
      });
      return;
    }

    const nameSlugFormat = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const expectedPrefix = `${nameSlugFormat}-`;
    if (!slug.startsWith(expectedPrefix)) {
      ctx.addIssue({
        path: ['slug'],
        code: 'custom',
        message: `Slug must start with "${expectedPrefix}" followed by 4 alphanumeric characters`,
      });
      return;
    }

    const suffix = slug.slice(expectedPrefix.length);
    if (!/^[a-zA-Z0-9]{4}$/.test(suffix)) {
      ctx.addIssue({
        path: ['slug'],
        code: 'custom',
        message:
          'Slug must end with exactly 4 alphanumeric characters after the dash',
      });
    }
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
