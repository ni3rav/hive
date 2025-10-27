import { apiGet, apiPost } from '@/lib/api-client';
import type {
  Workspace,
  UserWorkspace,
  CreateWorkspaceData,
  VerifiedWorkspace,
} from '@/types/workspace';

export async function apiVerifyWorkspace(
  workspaceSlug: string,
): Promise<VerifiedWorkspace> {
  return apiGet<VerifiedWorkspace>(`/api/workspace/verify/${workspaceSlug}`);
}

export async function apiGetUserWorkspaces(): Promise<UserWorkspace[]> {
  return apiGet<UserWorkspace[]>(`/api/workspace`);
}

export async function apiCreateWorkspace(
  data: CreateWorkspaceData,
): Promise<Workspace> {
  return apiPost<Workspace, CreateWorkspaceData>(`/api/workspace`, data);
}
