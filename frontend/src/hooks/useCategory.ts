import {
  apiCreateCategory,
  apiDeleteCategory,
  apiGetUserCategories,
  apiUpdateCategory,
} from '@/api/category';
import type { Category, CreateCategoryData } from '@/types/category';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';

function generateRandomChars(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateSlug(name: string): string {
  if (!name) return '';

  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-'); 

  const randomSuffix = generateRandomChars(4);

  return `${baseSlug}-${randomSuffix}`;
}

export function useUserCategories() {
  return useQuery({
    queryKey: QueryKeys.categoryKeys().base,
    queryFn: apiGetUserCategories,
    retry: false,
  });
}
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CreateCategoryData, 'slug'>) => {
      const slug = generateSlug(data.name);
      const completeData: CreateCategoryData = { ...data, slug };
      return apiCreateCategory(completeData);
    },
    onMutate: async (newCategoryData) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.categoryKeys().base,
      });
      const previous = queryClient.getQueryData<Category[]>(
        QueryKeys.categoryKeys().base,
      );
      const optimistic: Category = {
        id: `optimistic-${Date.now()}`,
        slug: generateSlug(newCategoryData.name),
        ...newCategoryData,
      } as Category;
      queryClient.setQueryData(
        QueryKeys.categoryKeys().base,
        (old: Category[] | undefined) =>
          old ? [optimistic, ...old] : [optimistic],
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('new category created!!');
      queryClient.invalidateQueries({ queryKey: QueryKeys.categoryKeys().base });
    },
    onError: (error, _variables, context) => {
      const message = getErrorMessage(error, 'Failed to create category');
      toast.error(message);
      if (context?.previous) {
        queryClient.setQueryData(QueryKeys.categoryKeys().base, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.categoryKeys().base });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: Partial<Omit<CreateCategoryData, 'slug'>>;
    }) => {
      const completeData: Partial<CreateCategoryData> = { ...data };
      if (data.name) {
        completeData.slug = generateSlug(data.name);
      }
      return apiUpdateCategory(categoryId, completeData);
    },
    onMutate: async ({ categoryId, data }) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.categoryKeys().base,
      });
      const previous = queryClient.getQueryData<Category[]>(
        QueryKeys.categoryKeys().base,
      );
      queryClient.setQueryData(
        QueryKeys.categoryKeys().base,
        (old: Category[] | undefined) =>
          (old || []).map((c) => {
            if (c.id === categoryId) {
              const updatedData = { ...c, ...data };
              if (data.name) {
                updatedData.slug = generateSlug(data.name);
              }
              return updatedData as Category;
            }
            return c;
          }),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Category updated');
    },
    onError: (error, _variables, context) => {
      const message = getErrorMessage(error, 'Failed to update category');
      toast.error(message);
      if (context?.previous) {
        queryClient.setQueryData(QueryKeys.categoryKeys().base, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.categoryKeys().base });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => apiDeleteCategory(categoryId),
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.categoryKeys().base,
      });
      const previous = queryClient.getQueryData<Category[]>(
        QueryKeys.categoryKeys().base,
      );
      queryClient.setQueryData(
        QueryKeys.categoryKeys().base,
        (old: Category[] | undefined) =>
          (old || []).filter((c) => c.id !== categoryId),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Category deleted');
    },
    onError: (error, _variables, context) => {
      const message = getErrorMessage(error, 'Failed to delete category');
      toast.error(message);
      if (context?.previous) {
        queryClient.setQueryData(QueryKeys.categoryKeys().base, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.categoryKeys().base });
    },
  });
}