import { z } from 'zod';

/**
 * common validation schemas used across multiple modules
 */

export const sessionIdSchema = z.object({
  sessionId: z.uuid('Invalid session ID'),
});
