import { z } from 'zod';

const envSchema = z.object({
VITE_HIVE_API_BASE_URL: z.string().url('VITE_HIVE_API_BASE_URL must be a valid URL'),
MODE: z.enum(['development', 'production', 'test']).default('development'),
});

type EnvType = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse({
VITE_HIVE_API_BASE_URL: import.meta.env.VITE_HIVE_API_BASE_URL,
MODE: import.meta.env.MODE,
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