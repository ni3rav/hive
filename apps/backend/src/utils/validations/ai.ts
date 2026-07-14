import z from 'zod';

export const saveAiProviderSchema = z.object({
  apiKey: z.string().trim().min(1, 'API key is required'),
  model: z.string().trim().min(1, 'Model is required').max(100).optional(),
});

export const analyzePostSchema = z.object({
  content: z.string().trim().min(1, 'Content is required'),
  userPrompt: z.string().trim().max(2000).optional(),
});

export const transformSelectionActionSchema = z.enum([
  'change_tone',
  'fix_grammar',
  'elaborate',
  'concise',
]);

export const transformSelectionSchema = z.object({
  selection: z.string().trim().min(1, 'Selection is required'),
  action: transformSelectionActionSchema,
  tone: z.string().trim().min(1).max(80).optional(),
});
