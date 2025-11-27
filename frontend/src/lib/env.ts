import { z } from 'zod';

const envSchema = z.object({
VITE_HIVE_API_BASE_URL: z.string().url('VITE_HIVE_API_BASE_URL must be a valid URL'),
MODE: z.enum(['development', 'production', 'test']).default('development'),
VITE_APP_URL: z.url('VITE_APP_URL must be a valid URL'),
VITE_DOCS_URL: z.url('VITE_DOCS_URL must be a valid URL'),
});

type EnvType = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse({
VITE_HIVE_API_BASE_URL: import.meta.env.VITE_HIVE_API_BASE_URL,
VITE_APP_URL: import.meta.env.VITE_APP_URL,
MODE: import.meta.env.MODE,
VITE_DOCS_URL: import.meta.env.VITE_DOCS_URL,
});

if (!parsedEnv.success) {
  console.error(
  'Invalid environment variables:',
  parsedEnv.error.flatten().fieldErrors,
  );
    throw new Error('Invalid environment variables.');
}

export const env = parsedEnv.data as EnvType;
export const isDev = env.MODE === 'development';
export const isProd = env.MODE === 'production';