import {
  apiCreateTag,
  apiDeleteTag,
  apiGetWorkspaceTags,
  apiUpdateTag,
} from '@/api/tag';
import type { Tag, CreateTagData } from '@/types/tag';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';

export function useWorkspaceTags(workspaceSlug: string) {
  return useQuery({
    queryKey: QueryKeys.tagKeys().list(workspaceSlug),
    queryFn: () => apiGetWorkspaceTags(workspaceSlug),
    retry: false,
    enabled: !!workspaceSlug,
  });
}

export function useCreateTag(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagData) => apiCreateTag(workspaceSlug, data),
    onSuccess: () => {
      toast.success('Tag created');
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tagKeys().list(workspaceSlug),
      });
    },
    onError: (error) => {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status !== 409) {
        const message = getErrorMessage(error, 'Failed to create tag');
        toast.error(message);
      }
    },
  });
}

export function useUpdateTag(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tagSlug,
      data,
    }: {
      tagSlug: string;
      data: Partial<CreateTagData>;
    }) => {
      if (!tagSlug || !workspaceSlug) {
        throw new Error('Missing required parameters');
      }
      return apiUpdateTag(workspaceSlug, tagSlug, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tagKeys().list(workspaceSlug),
      });
      toast.success('Tag updated');
    },
    onError: (error) => {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status !== 409) {
        console.error('Update error:', error);
        toast.error(getErrorMessage(error, 'Failed to update tag'));
      }
    },
  });
}

export function useDeleteTag(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagSlug: string) => apiDeleteTag(workspaceSlug, tagSlug),
    onMutate: async (tagSlug) => {
      const queryKey = QueryKeys.tagKeys().list(workspaceSlug);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Tag[]>(queryKey);

      queryClient.setQueryData(queryKey, (old: Tag[] | undefined) =>
        (old || []).filter((t) => t.slug !== tagSlug),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Tag deleted');
    },
    onError: (error, _variables, context) => {
      const message = getErrorMessage(error, 'Failed to delete tag');
      toast.error(message);
      if (context?.previous) {
        queryClient.setQueryData(
          QueryKeys.tagKeys().list(workspaceSlug),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tagKeys().list(workspaceSlug),
      });
    },
  });
}

