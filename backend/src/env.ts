import { cleanEnv, str, port, bool } from 'envalid';

const validatedEnv = cleanEnv(process.env, {
  DATABASE_URL: str(),
  PORT: port(),
  NODE_ENV: str(),
  FRONTEND_URL: str(),
  RESEND_API_KEY: str(),
  EMAIL_DOMAIN: str(),
  DMA: bool({ default: false }),
  DEV_USER_ID: str({ default: '' }),
});

export const env = {
  ...validatedEnv,
  isDevelopment: validatedEnv.NODE_ENV === 'development',
  isProduction: validatedEnv.NODE_ENV === 'production',
};
