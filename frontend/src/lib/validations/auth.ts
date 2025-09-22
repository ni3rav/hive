import { z } from "zod";

export const loginSchema = z.object({
  validatedEmail: z.email(),
  validatedPassword: z.string().min(8),
});

export const registerSchema = z.object({
  validatedName: z.string().min(1),
  validatedEmail: z.email(),
  validatedPassword: z.string().min(8),
});

export const verifyEmailSchema = z.object({
  validatedUserId: z.string().min(1),
  validatedToken: z.string().min(1),
});
