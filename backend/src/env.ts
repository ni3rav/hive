import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  PORT: port(),
  NODE_ENV: str(),
  FRONTEND_URL: str(),
  RESEND_API_KEY: str(),
});
