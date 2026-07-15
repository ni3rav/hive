import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const verifyEmailSchema = z.object({
  userId: z.uuid('Invalid userId'),
  token: z.string().trim().min(1, 'Invalid token'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  email: z.email('Invalid email'),
  token: z.string().trim().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const editProfileSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    email: z.email('Invalid email').optional(),
  })
  .refine((data) => data.name || data.email, {
    message: "At least one of 'name' or 'email' must be provided",
  });

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type VerifyEmailData = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type EditProfileData = z.infer<typeof editProfileSchema>;

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
