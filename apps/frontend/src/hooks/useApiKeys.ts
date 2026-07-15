import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  apiCreateWorkspaceApiKey,
  apiDeleteWorkspaceApiKey,
  apiGetWorkspaceApiKeys,
} from '@/api/api-key';
import type {
  CreateWorkspaceApiKeyPayload,
  WorkspaceApiKey,
} from '@/types/api-key';
import { QueryKeys } from '@/lib/query-key-factory';
import { getErrorMessage } from '@/lib/error-utils';

export function useWorkspaceApiKeys(workspaceSlug: string | undefined) {
  return useQuery({
    queryKey: QueryKeys.apiKeyKeys().list(workspaceSlug || ''),
    queryFn: () => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }

      return apiGetWorkspaceApiKeys(workspaceSlug);
    },
    enabled: !!workspaceSlug,
    retry: false,
  });
}

export function useCreateWorkspaceApiKey(workspaceSlug: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceApiKeyPayload) => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }

      return apiCreateWorkspaceApiKey(workspaceSlug, data);
    },
    onSuccess: (response) => {
      toast.success('API key created');
      if (!workspaceSlug) return;

      const queryKey = QueryKeys.apiKeyKeys().list(workspaceSlug);
      queryClient.setQueryData<WorkspaceApiKey[]>(queryKey, (old) =>
        old ? [response.metadata, ...old] : [response.metadata],
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to create API key'));
    },
  });
}

export function useDeleteWorkspaceApiKey(workspaceSlug: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (apiKeyId: string) => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }

      return apiDeleteWorkspaceApiKey(workspaceSlug, apiKeyId);
    },
    onMutate: async (apiKeyId) => {
      if (!workspaceSlug) {
        return { previous: undefined };
      }

      const queryKey = QueryKeys.apiKeyKeys().list(workspaceSlug);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<WorkspaceApiKey[]>(queryKey);
      queryClient.setQueryData<WorkspaceApiKey[]>(queryKey, (old) =>
        (old || []).filter((key) => key.id !== apiKeyId),
      );

      return { previous, queryKey };
    },
    onSuccess: () => {
      toast.success('API key deleted');
    },
    onError: (error, _vars, context) => {
      toast.error(getErrorMessage(error, 'Failed to delete API key'));
      if (context?.previous && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
  });
}
