import { z } from 'zod';
import { sessionIdSchema } from './common';

export const getAuthorByIdSchema = z.object({
  authorId: z.uuid('Invalid authorId'),
  userId: z.uuid('Invalid userId'),
});

export { sessionIdSchema };

export const createAuthorSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  email: z.email('invalid email'),
  about: z.string().trim().optional(),
  socialLinks: z
    .record(z.string(), z.url('Invalid URL for social link'))
    .optional(),
});

export const deleteAuthorSchema = z.object({
  authorId: z.uuid('Invalid authorId'),
  sessionId: z.uuid('Invalid sessionId'),
});

export const updateAuthorSchema = z.object({
  authorId: z.uuid('Invalid authorId'),
  sessionId: z.uuid('Invalid sessionId'),
  data: z
    .object({
      name: z.string().trim().min(1, 'Name is required').optional(),
      email: z.email('Invalid email').optional(),
      about: z.string().trim().optional(),
      socialLinks: z
        .record(z.string(), z.url('Invalid URL for social link'))
        .optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      { message: 'please provide at least one field to update' },
    ),
});
