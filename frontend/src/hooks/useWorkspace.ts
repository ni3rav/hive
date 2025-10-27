import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  apiCreateWorkspace,
  apiGetUserWorkspaces,
  apiVerifyWorkspace,
} from '@/api/workspace';
import { QueryKeys } from '@/lib/query-key-factory';
import type { CreateWorkspaceData, UserWorkspace } from '@/types/workspace';
import { toast } from 'sonner';

export function useWorkspaceVerification(workspaceSlug?: string) {
  const query = useQuery({
    queryKey: QueryKeys.workspaceKeys().verify(workspaceSlug!),
    queryFn: () => apiVerifyWorkspace(workspaceSlug!),
    enabled: !!workspaceSlug,
    retry: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast.error('Failed to verify workspace access');
    }
  }, [query.isError, query.error]);

  return query;
}

export function useUserWorkspaces() {
  const query = useQuery({
    queryKey: QueryKeys.workspaceKeys().list(),
    queryFn: () => apiGetUserWorkspaces(),
    retry: false,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      toast.error('Failed to load workspaces');
    }
  }, [query.isError, query.error]);

  return query;
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkspaceData) => apiCreateWorkspace(data),
    onMutate: async (newWs) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.workspaceKeys().list(),
      });

      const previous = queryClient.getQueryData<UserWorkspace[]>(
        QueryKeys.workspaceKeys().list(),
      );

      const nowIso = new Date().toISOString();
      const optimistic: UserWorkspace = {
        id: `optimistic-${Date.now()}`,
        name: newWs.workspaceName,
        slug: newWs.workspaceSlug,
        createdAt: nowIso,
        role: 'owner',
        joinedAt: nowIso,
      };

      queryClient.setQueryData<UserWorkspace[]>(
        QueryKeys.workspaceKeys().list(),
        (old) => (old ? [optimistic, ...old] : [optimistic]),
      );

      return { previous } as { previous?: UserWorkspace[] };
    },
    onSuccess: () => {
      toast.success('Workspace created');
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(
          QueryKeys.workspaceKeys().list(),
          ctx.previous,
        );
      }
      toast.error('Failed to create workspace');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workspaceKeys().list(),
      });
    },
  });
}
