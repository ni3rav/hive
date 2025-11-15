import { cleanEnv, str, port } from 'envalid';

const validatedEnv = cleanEnv(process.env, {
  DATABASE_URL: str(),
  PORT: port(),
  NODE_ENV: str(),
  FRONTEND_URL: str(),
  RESEND_API_KEY: str(),
});

export const env = {
  ...validatedEnv,
  isDevelopment: validatedEnv.NODE_ENV === 'development',
  isProduction: validatedEnv.NODE_ENV === 'production',
};
