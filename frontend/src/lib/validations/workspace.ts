import { z } from "zod";

export const createWorkspaceSchema = z.object({
  workspaceName: z.string().min(1, "Workspace name is required"),
  workspaceSlug: z.string().regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed")
});