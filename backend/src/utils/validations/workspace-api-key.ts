import z from 'zod';

export const createWorkspaceApiKeySchema = z.object({
  workspaceSlug: z.string().trim().min(1, 'Workspace slug is required'),
  description: z
    .string()
    .trim()
    .min(3, 'Description must be at least 3 characters')
    .max(120, 'Description must be at most 120 characters'),
});

export const deleteWorkspaceApiKeySchema = z.object({
  workspaceSlug: z.string().trim().min(1, 'Workspace slug is required'),
  apiKeyId: z.uuid('API key ID must be a valid UUID'),
});
