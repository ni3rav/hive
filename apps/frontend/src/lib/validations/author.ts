import { z } from 'zod';

export const createAuthorSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  email: z.email('invalid email'),
  about: z.string().trim().optional(),
  socialLinks: z
    .record(z.string(), z.url('Invalid URL for social link'))
    .optional(),
});

export const updateAuthorSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    email: z.email('Invalid email').optional(),
    about: z.string().trim().optional(),
    socialLinks: z
      .record(z.string(), z.url('Invalid URL for social link'))
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'please provide at least one field to update',
  });
