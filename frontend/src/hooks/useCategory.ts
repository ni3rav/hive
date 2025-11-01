import {
  apiCreateCategory,
  apiDeleteCategory,
  apiGetUserCategories,
  apiUpdateCategory,
} from '@/api/category';
import type { Category, CreateCategoryData, CategoryFormData } from '@/types/category';
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

export function useUserCategories(workspaceSlug: string) {
  return useQuery({
    queryKey: QueryKeys.categoryKeys().list(workspaceSlug),
    queryFn: () => apiGetUserCategories(workspaceSlug),
    retry: false,
    enabled: !!workspaceSlug,
  });
}
export function useCreateCategory(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CreateCategoryData, 'slug'>) => {
      const slug = generateSlug(data.name);
      const completeData: CreateCategoryData = { ...data, slug };
      return apiCreateCategory(workspaceSlug, completeData);
    },
    onMutate: async (newCategoryData) => {
      const queryKey = QueryKeys.categoryKeys().list(workspaceSlug);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Category[]>(queryKey);
      
      const optimistic: Category = {
        id: `optimistic-${Date.now()}`,
        slug: generateSlug(newCategoryData.name),
        ...newCategoryData,
      } as Category;
      
      queryClient.setQueryData(
        queryKey,
        (old: Category[] | undefined) =>
          old ? [optimistic, ...old] : [optimistic],
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('new category created!!');
      queryClient.invalidateQueries({
        queryKey: QueryKeys.categoryKeys().list(workspaceSlug),
      });
    },
    onError: (error, _variables, context) => {
      const message = getErrorMessage(error, 'Failed to create category');
      toast.error(message);
      if (context?.previous) {
        queryClient.setQueryData(
          QueryKeys.categoryKeys().list(workspaceSlug),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.categoryKeys().list(workspaceSlug),
      });
    },
  });
}

export function useUpdateCategory(workspaceSlug: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      categorySlug,
      data,
    }: {
      categorySlug: string;
      data: CategoryFormData;
    }) => {
      if (!categorySlug || !workspaceSlug) {
        throw new Error('Missing required parameters');
      }
      return apiUpdateCategory(workspaceSlug, categorySlug, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.categoryKeys().list(workspaceSlug),
      });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error(getErrorMessage(error, 'Failed to update category'));
    },
  });
}

export function useDeleteCategory(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categorySlug: string) =>
      apiDeleteCategory(workspaceSlug, categorySlug),
    onMutate: async (categorySlug) => {
      const queryKey = QueryKeys.categoryKeys().list(workspaceSlug);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Category[]>(queryKey);

      queryClient.setQueryData(
        queryKey,
        (old: Category[] | undefined) =>
          (old || []).filter((c) => c.slug !== categorySlug),
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
        queryClient.setQueryData(
          QueryKeys.categoryKeys().list(workspaceSlug),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.categoryKeys().list(workspaceSlug),
      });
    },
  });
}