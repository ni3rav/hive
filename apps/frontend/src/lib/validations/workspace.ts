import { z } from "zod";

export const createWorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name must be at most 30 characters")
    .trim(),
  workspaceSlug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(35, "Slug must be at most 35 characters")
    .regex(
      /^[a-z0-9]+([a-z0-9-]*[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen."
    )
    .refine((slug) => !slug.includes("--"), {
      message: "Slug cannot contain consecutive hyphens",
    }),
});