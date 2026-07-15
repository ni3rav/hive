import { WorkspaceApiKeyMetadata } from '../utils/workspace-api-key';

export type WorkspaceApiKeyResponseDto = {
  id: string;
  workspaceId: string;
  description: string;
  createdByUserId: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  lastUsedIp: string | null;
};

export function toWorkspaceApiKeyResponseDto(
  key: WorkspaceApiKeyMetadata,
): WorkspaceApiKeyResponseDto {
  return {
    id: key.id,
    workspaceId: key.workspaceId,
    description: key.description,
    createdByUserId: key.createdByUserId,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt ?? null,
    lastUsedIp: key.lastUsedIp ?? null,
  };
}

export function toWorkspaceApiKeyListResponseDto(
  keys: WorkspaceApiKeyMetadata[],
): WorkspaceApiKeyResponseDto[] {
  return keys.map((key) => toWorkspaceApiKeyResponseDto(key));
}
