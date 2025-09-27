import { z } from "zod";

export const getAuthorByIdSchema = z.object({
  authorId: z.uuid("Invalid authorId"),
  userId: z.uuid("Invalid userId"),
});

export const getAuthorByUserIdSchema = z.object({
  userId: z.uuid("Invalid userId"),
});

export const sessionIdSchema = z.object({
  sessionId: z.uuid(),
});

export const createAuthorSchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.email("invalid email"),
  about: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
})

export const deleteAuthorSchema = z.object({
  authorId: z.uuid("Invalid authorId"),
  sessionId: z.uuid("Invalid sessionId"),
});