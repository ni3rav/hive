import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Author, CreateAuthorData } from '@/types/author';

export async function apiGetWorkspaceAuthors(): Promise<Author[]> {
  return apiGet<Author[]>('/api/author/');
}

export async function apiCreateAuthor(data: CreateAuthorData): Promise<Author> {
  return apiPost<Author, CreateAuthorData>('/api/author/', data);
}

export async function apiDeleteAuthor(authorId: string): Promise<void> {
  return apiDelete<void>(`/api/author/${authorId}`);
}

export async function apiUpdateAuthor(
  authorId: string,
  data: Partial<CreateAuthorData>,
): Promise<Author> {
  return apiPatch<Author, Partial<CreateAuthorData>>(
    `/api/author/${authorId}`,
    data,
  );
}
