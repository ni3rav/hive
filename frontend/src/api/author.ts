import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Author } from '@/types/author';

export async function apiGetUserAuthors() {
  return apiGet('/api/authors/me');
}

export async function apiCreateAuthor(data: Author) {
  return apiPost('/api/authors/', data);
}

export async function apiDeleteAuthor(authorId: string) {
  return apiDelete(`/api/authors/${authorId}`);
}

export async function apiUpdateAuthor(authorId: string, data: Partial<Author>) {
  return apiPatch(`/api/authors/${authorId}`, data);
}
