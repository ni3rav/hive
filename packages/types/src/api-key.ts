export interface WorkspaceApiKey {
  id: string;
  workspaceId: string;
  description: string;
  createdByUserId: string;
  createdAt: string;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
}

export interface CreateWorkspaceApiKeyPayload {
  description: string;
}

export interface CreateWorkspaceApiKeyResponse {
  apiKey: string;
  metadata: WorkspaceApiKey;
}
