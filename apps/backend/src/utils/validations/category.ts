import { z } from 'zod';
import {
  createCategorySchema as baseCreateCategorySchema,
  updateCategorySchema as baseUpdateCategorySchema,
} from '@hive/types';

export const createCategorySchema = baseCreateCategorySchema;

export const updateCategorySchema = z.object({
  categorySlug: z.string().trim().min(1, 'Category slug is required'),
  data: baseUpdateCategorySchema,
});

export const deleteCategorySchema = z.object({
  categorySlug: z.string().trim().min(1, 'Category slug is required'),
});

export type { CreateCategoryInput, UpdateCategoryInput } from '@hive/types';
