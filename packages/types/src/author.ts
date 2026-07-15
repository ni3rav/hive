import { z } from 'zod';

export interface Author {
  id: string;
  name: string;
  email: string;
  about?: string;
  socialLinks?: Record<string, string>;
}

export type CreateAuthorData = Omit<Author, 'id'>;

export const createAuthorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Invalid email'),
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
    message: 'Please provide at least one field to update',
  });

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
