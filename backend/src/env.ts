import { cleanEnv, str, port } from "envalid";

export const env = cleanEnv(process.env, {
  POSTGRES_PASSWORD: str(),
  DATABASE_URL: str(),
  PORT: port(),
  NODE_ENV: str(),
});
