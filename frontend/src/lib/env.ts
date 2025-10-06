import z from 'zod';

const envSchema = z.object({
  VITE_HIVE_API_BASE_URL: z.url(),
});

export const env = envSchema.parse(import.meta.env);
