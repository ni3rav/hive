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
        message: `Slug must be in the format "<name>-<4 alphanumeric characters>", and length must be name.length + 5`,
      });
      return;
    }
    const expectedPrefix = `${name}-`;
    if (!slug.startsWith(expectedPrefix)) {
      ctx.addIssue({
        path: ['slug'],
        code: 'custom',
        message: `Slug must be in the format "<name>-<4 alphanumeric characters>", and length must be name.length + 5`,
      });
      return;
    }
    const suffix = slug.slice(expectedPrefix.length);
    if (!/^[a-zA-Z0-9]{4}$/.test(suffix) || slug.length !== name.length + 5) {
      ctx.addIssue({
        path: ['slug'],
        code: 'custom',
        message:
          'Slug must be in the format "<name>-<4 alphanumeric characters>", and length must be name.length + 5',
      });
    }
  });
