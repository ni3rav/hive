import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Author, CreateAuthorData } from '@/types/author';

export async function apiGetWorkspaceAuthors(
  workspaceSlug: string,
): Promise<Author[]> {
  return apiGet<Author[]>(`/api/author/${workspaceSlug}`);
}

export async function apiCreateAuthor(
  workspaceSlug: string,
  data: CreateAuthorData,
): Promise<Author> {
  return apiPost<Author, CreateAuthorData>(
    `/api/author/${workspaceSlug}`,
    data,
  );
}

export async function apiDeleteAuthor(
  workspaceSlug: string,
  authorId: string,
): Promise<void> {
  return apiDelete<void>(`/api/author/${workspaceSlug}/${authorId}`);
}

export async function apiUpdateAuthor(
  workspaceSlug: string,
  authorId: string,
  data: Partial<CreateAuthorData>,
): Promise<Author> {
  return apiPatch<Author, Partial<CreateAuthorData>>(
    `/api/author/${workspaceSlug}/${authorId}`,
    data,
  );
}
