import { z } from "zod";

export const editProfileSchema = z
  .object({
    // At least one of 'name' or 'email' must be present and non-empty
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email").optional(),
  })
  .refine((data) => data.name || data.email, {
    message: "At least one of 'name' or 'email' must be provided",
  });
