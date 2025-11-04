import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Tag, CreateTagData } from '@/types/tag';

export async function apiGetWorkspaceTags(
  workspaceSlug: string,
): Promise<Tag[]> {
  return apiGet<Tag[]>(`/api/tag/${workspaceSlug}`);
}

export async function apiCreateTag(
  workspaceSlug: string,
  data: CreateTagData,
): Promise<Tag> {
  return apiPost<Tag, CreateTagData>(`/api/tag/${workspaceSlug}`, data);
}

export async function apiDeleteTag(
  workspaceSlug: string,
  tagSlug: string,
): Promise<void> {
  return apiDelete<void>(`/api/tag/${workspaceSlug}/${tagSlug}`);
}

export async function apiUpdateTag(
  workspaceSlug: string,
  tagSlug: string,
  data: Partial<CreateTagData>,
): Promise<Tag> {
  return apiPatch<Tag, Partial<CreateTagData>>(
    `/api/tag/${workspaceSlug}/${tagSlug}`,
    data,
  );
}
