import { apiDelete, apiGet, apiPost } from '@/lib/api-client';
import type {
  CreateWorkspaceApiKeyPayload,
  CreateWorkspaceApiKeyResponse,
  WorkspaceApiKey,
} from '@/types/api-key';

export async function apiGetWorkspaceApiKeys(
  workspaceSlug: string,
): Promise<WorkspaceApiKey[]> {
  return apiGet<WorkspaceApiKey[]>(
    `/api/workspace/${workspaceSlug}/api-keys`,
  );
}

export async function apiCreateWorkspaceApiKey(
  workspaceSlug: string,
  data: CreateWorkspaceApiKeyPayload,
): Promise<CreateWorkspaceApiKeyResponse> {
  return apiPost<CreateWorkspaceApiKeyResponse, CreateWorkspaceApiKeyPayload>(
    `/api/workspace/${workspaceSlug}/api-keys`,
    data,
  );
}

export async function apiDeleteWorkspaceApiKey(
  workspaceSlug: string,
  apiKeyId: string,
): Promise<void> {
  return apiDelete<void>(
    `/api/workspace/${workspaceSlug}/api-keys/${apiKeyId}`,
  );
}

