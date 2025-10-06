import z from 'zod';

const envSchema = z.object({
  VITE_HIVE_API_BASE_URL: z.url(),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse({
  VITE_HIVE_API_BASE_URL: import.meta.env.VITE_HIVE_API_BASE_URL,
  MODE: import.meta.env.MODE,
});

export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
