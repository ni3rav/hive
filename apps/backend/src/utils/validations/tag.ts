import { z } from 'zod';
import {
  createTagSchema as baseCreateTagSchema,
  updateTagSchema as baseUpdateTagSchema,
} from '@hive/types';

export const createTagSchema = baseCreateTagSchema;

export const updateTagSchema = z.object({
  tagSlug: z.string().trim().min(1, 'Tag slug is required'),
  data: baseUpdateTagSchema,
});

export const deleteTagSchema = z.object({
  tagSlug: z.string().trim().min(1, 'Tag slug is required'),
});

export type { CreateTagInput, UpdateTagInput } from '@hive/types';
