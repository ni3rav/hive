import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Category, CreateCategoryData } from '@/types/category';

export async function apiGetUserCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/api/category/');
}

export async function apiCreateCategory(data: CreateCategoryData): Promise<Category> {
  return apiPost<Category, CreateCategoryData>('/api/category/', data);
}

export async function apiDeleteCategory(categoryId: string): Promise<void> {
  return apiDelete<void>(`/api/category/${categoryId}`);
}

export async function apiUpdateCategory(
  categoryId: string,
  data: Partial<CreateCategoryData>,
): Promise<Category> {
  return apiPatch<Category, Partial<CreateCategoryData>>(
    `/api/category/${categoryId}`,
    data,
  );
}
