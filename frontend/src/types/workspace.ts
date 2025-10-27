export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface UserWorkspace extends Workspace {
  role: string;
  joinedAt: string;
}

export interface CreateWorkspaceData {
  workspaceName: string;
  workspaceSlug: string;
}

export interface VerifiedWorkspace extends Workspace {
  role?: string;
}
