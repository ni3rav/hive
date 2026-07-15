import { z } from 'zod';
import { sessionIdSchema } from './common';
import {
  createAuthorSchema as baseCreateAuthorSchema,
  updateAuthorSchema as baseUpdateAuthorSchema,
} from '@hive/types';

export const getAuthorByIdSchema = z.object({
  authorId: z.uuid('Invalid authorId'),
});

export { sessionIdSchema };

export const createAuthorSchema = baseCreateAuthorSchema;

export const deleteAuthorSchema = z.object({
  authorId: z.uuid('Invalid authorId'),
});

export const updateAuthorSchema = z.object({
  authorId: z.uuid('Invalid authorId'),
  data: baseUpdateAuthorSchema,
});

export type { CreateAuthorInput, UpdateAuthorInput } from '@hive/types';
