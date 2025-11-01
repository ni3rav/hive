import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type { Category, CreateCategoryData } from '@/types/category';

export async function apiGetUserCategories(
  workspaceSlug: string,
): Promise<Category[]> {
  return apiGet<Category[]>(`/api/category/${workspaceSlug}`);
}

export async function apiCreateCategory(
  workspaceSlug: string,
  data: CreateCategoryData,
): Promise<Category> {
  return apiPost<Category, CreateCategoryData>(
    `/api/category/${workspaceSlug}`,
    data,
  );
}

export async function apiDeleteCategory(
  workspaceSlug: string,
  categorySlug: string,
): Promise<void> {
  return apiDelete<void>(`/api/category/${workspaceSlug}/${categorySlug}`);
}

export async function apiUpdateCategory(
  workspaceSlug: string,
  categorySlug: string,
  data: Partial<CreateCategoryData>,
): Promise<Category> {
  return apiPatch<Category, Partial<CreateCategoryData>>(
    `/api/category/${workspaceSlug}/${categorySlug}`,
    data,
  );
}