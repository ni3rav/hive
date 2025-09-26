import { z } from "zod";

export const getAuthorByIdSchema = z.object({
  authorId: z.uuid("Invalid authorId"),
  userId: z.uuid("Invalid userId"),
});

export const getAuthorByUserIdSchema = z.object({
  userId: z.uuid("Invalid userId"),
});
