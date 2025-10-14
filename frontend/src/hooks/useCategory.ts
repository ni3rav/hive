import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Category } from '@/types/category';

const BASE = '/api/categories';

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'include',
    ...init,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function listCategories(): Promise<Category[]> {
  return http<Category[]>(BASE);
}

export function useCategories() {
  const q = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    staleTime: 1000 * 60 * 5,           // cache for 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: (prev) => prev,    // instant render from cache on revisit
  });
  const data = useMemo(() => q.data ?? [], [q.data]);
  return { ...q, data };
}

// Accepts full payload for create, partial for update (PATCH)
type UpdateCategoryInput = { id: string } & Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>;
type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCategoryInput | CreateCategoryInput) => {
      if ('id' in payload) {
        const { id, ...rest } = payload;
        return http<Category>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(rest) });
      }
      return http<Category>(BASE, { method: 'POST', body: JSON.stringify(payload) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http<void>(`${BASE}/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}