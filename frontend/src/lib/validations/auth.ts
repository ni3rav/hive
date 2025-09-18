import { z } from "zod";

export const loginSchema = z.object({
  validatedEmail: z.email(),
  validatedPassword: z.string().min(8),
});