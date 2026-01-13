import { cleanEnv, str, port, bool } from 'envalid';

const validatedEnv = cleanEnv(process.env, {
  DATABASE_URL: str(),
  PORT: port(),
  NODE_ENV: str(),
  FRONTEND_URL: str(),
  RESEND_API_KEY: str(),
  EMAIL_DOMAIN: str(),
  R2_ACCOUNT_ID: str(),
  R2_ACCESS_KEY_ID: str(),
  R2_SECRET_ACCESS_KEY: str(),
  R2_BUCKET_NAME: str(),
  R2_PUBLIC_URL: str(),
  AZURE_FUNCTION_SECRET: str(),
  AZURE_THUMBHASH_FUNCTION_URL: str(),
  DMA: bool({ default: false }),
  DEV_USER_ID: str({ default: '' }),
});

export const env = {
  ...validatedEnv,
  isDevelopment: validatedEnv.NODE_ENV === 'development',
  isProduction: validatedEnv.NODE_ENV === 'production',
};
