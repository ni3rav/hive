import { z } from 'zod';

// aligned with backend validation schemas
export const loginSchema = z.object({
  validatedEmail: z.email('Invalid email'),
  validatedPassword: z
    .string()
    .min(8, 'Enter your 8 character password please'),
});

export const registerSchema = z.object({
  validatedName: z.string().trim().min(1, 'Name is required'),
  validatedEmail: z.email('Invalid email'),
  validatedPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export const verifyEmailSchema = z.object({
  validatedUserId: z.uuid('Invalid userId'),
  validatedToken: z.string().trim().min(1, 'Invalid token'),
});
