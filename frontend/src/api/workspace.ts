import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
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

export async function apiUpdateWorkspace(
  workspaceSlug: string,
  data: { name: string },
): Promise<Workspace> {
  return apiPatch<Workspace, { name: string }>(
    `/api/workspace/${workspaceSlug}`,
    data,
  );
}

export async function apiDeleteWorkspace(workspaceSlug: string): Promise<void> {
  return apiDelete<void>(`/api/workspace/${workspaceSlug}`);
}

export async function apiCheckSlugAvailability(
  slug: string,
): Promise<{ available: boolean }> {
  return apiGet<{ available: boolean }>(`/api/workspace/check-slug/${slug}`);
}
