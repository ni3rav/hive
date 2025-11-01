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
    mutationFn: (data: CreateCategoryData) => {
      return apiCreateCategory(workspaceSlug, data);
    },
    onSuccess: () => {
      toast.success('Category created');
      queryClient.invalidateQueries({
        queryKey: QueryKeys.categoryKeys().list(workspaceSlug),
      });
    },
    onError: (error) => {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status !== 409) {
        const message = getErrorMessage(error, 'Failed to create category');
        toast.error(message);
      }
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
      data: Partial<CreateCategoryData>;
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
      toast.success('Category updated');
    },
    onError: (error) => {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status !== 409) {
        console.error('Update error:', error);
        toast.error(getErrorMessage(error, 'Failed to update category'));
      }
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