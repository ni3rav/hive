import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Author } from '@/types/author';

export async function apiGetUserAuthors(): Promise<Author[]> {
  return apiGet('/api/author/');
}

export async function apiCreateAuthor(data: Author) {
  return apiPost('/api/author/', data);
}

export async function apiDeleteAuthor(authorId: string) {
  return apiDelete(`/api/author/${authorId}`);
}

export async function apiUpdateAuthor(authorId: string, data: Partial<Author>) {
  return apiPatch(`/api/author/${authorId}`, data);
}