import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import {
  apiCreateWorkspace,
  apiDeleteWorkspace,
  apiGetUserWorkspaces,
  apiUpdateWorkspace,
  apiVerifyWorkspace,
} from '@/api/workspace';
import { QueryKeys } from '@/lib/query-key-factory';
import type {
  CreateWorkspaceData,
  UpdateWorkspaceData,
  UserWorkspace,
} from '@/types/workspace';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';

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

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceSlug,
      data,
    }: {
      workspaceSlug: string;
      data: UpdateWorkspaceData;
    }) => apiUpdateWorkspace(workspaceSlug, data),
    onMutate: async ({ workspaceSlug, data }) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.workspaceKeys().list(),
      });

      const previous = queryClient.getQueryData<UserWorkspace[]>(
        QueryKeys.workspaceKeys().list(),
      );

      queryClient.setQueryData<UserWorkspace[]>(
        QueryKeys.workspaceKeys().list(),
        (old) =>
          (old || []).map((ws) =>
            ws.slug === workspaceSlug ? { ...ws, name: data.name } : ws,
          ),
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Workspace updated');
    },
    onError: (error, _vars, ctx) => {
      const message = getErrorMessage(error, 'Failed to update workspace');
      toast.error(message);
      if (ctx?.previous) {
        queryClient.setQueryData(
          QueryKeys.workspaceKeys().list(),
          ctx.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workspaceKeys().list(),
      });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceSlug: string) => apiDeleteWorkspace(workspaceSlug),
    onMutate: async (workspaceSlug) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.workspaceKeys().list(),
      });

      const previous = queryClient.getQueryData<UserWorkspace[]>(
        QueryKeys.workspaceKeys().list(),
      );

      queryClient.setQueryData<UserWorkspace[]>(
        QueryKeys.workspaceKeys().list(),
        (old) => (old || []).filter((ws) => ws.slug !== workspaceSlug),
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Workspace deleted');
    },
    onError: (error, _vars, ctx) => {
      const message = getErrorMessage(error, 'Failed to delete workspace');
      toast.error(message);
      if (ctx?.previous) {
        queryClient.setQueryData(
          QueryKeys.workspaceKeys().list(),
          ctx.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workspaceKeys().list(),
      });
    },
  });
}

export function useIsWorkspaceOwner(
  workspaceSlug: string | undefined,
): boolean {
  const { data: workspaces = [] } = useUserWorkspaces();

  return useMemo(() => {
    if (!workspaceSlug) return false;
    const workspace = workspaces.find((ws) => ws.slug === workspaceSlug);
    return workspace?.role === 'owner';
  }, [workspaceSlug, workspaces]);
}
