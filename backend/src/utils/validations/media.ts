import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const generatePresignedUrlSchema = z.object({
  filename: z
    .string()
    .trim()
    .min(1, 'filename is required')
    .max(255, 'filename must be at most 255 characters'),
  contentType: z.string().regex(/^image\//, 'file must be an image'),
  size: z
    .number()
    .int('size must be an integer')
    .positive('size must be positive')
    .max(
      MAX_FILE_SIZE,
      `file size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    ),
});

export const confirmUploadSchema = z.object({
  key: z.string().trim().min(1, 'key is required'),
  filename: z
    .string()
    .trim()
    .min(1, 'filename is required')
    .max(255, 'filename must be at most 255 characters'),
  contentType: z.string().min(1, 'contentType is required'),
  size: z
    .number()
    .int('size must be an integer')
    .positive('size must be positive'),
});

export const deleteMediaSchema = z.object({
  mediaId: z.uuid('invalid media id'),
});
