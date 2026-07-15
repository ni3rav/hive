import { z } from 'zod';

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;

export function isValidBase64(val: string): boolean {
  try {
    return BASE64_REGEX.test(val);
  } catch {
    return false;
  }
}

export const sessionIdSchema = z.object({
  sessionId: z.uuid('Invalid session ID'),
});
