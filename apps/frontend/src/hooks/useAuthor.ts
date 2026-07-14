import {
  apiCreateAuthor,
  apiDeleteAuthor,
  apiGetWorkspaceAuthors,
  apiUpdateAuthor,
} from '@/api/author';
import type { Author, CreateAuthorData } from '@/types/author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';
import type {
  DashboardStatsPayload,
  DashboardHeatmapPayload,
} from '@/types/dashboard';

const authorsKey = (workspaceSlug: string) =>
  [...QueryKeys.authorKeys().base, workspaceSlug] as const;

export function useWorkspaceAuthors(workspaceSlug: string) {
  return useQuery({
    queryKey: authorsKey(workspaceSlug),
    queryFn: () => apiGetWorkspaceAuthors(workspaceSlug),
    retry: false,
  });
}

export function useCreateAuthor(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAuthorData) =>
      apiCreateAuthor(workspaceSlug, data),
    onMutate: async (newAuthor) => {
      await queryClient.cancelQueries({
        queryKey: authorsKey(workspaceSlug),
      });
      const previous = queryClient.getQueryData<Author[]>(
        authorsKey(workspaceSlug),
      );
      const optimistic: Author = {
        id: `optimistic-${Date.now()}`,
        ...newAuthor,
      } as Author;
      queryClient.setQueryData(
        authorsKey(workspaceSlug),
        (old: Author[] | undefined) =>
          old ? [optimistic, ...old] : [optimistic],
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Author created');

      const statsKey = QueryKeys.workspaceKeys().dashboardStats(workspaceSlug);
      queryClient.setQueryData<DashboardStatsPayload>(statsKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          stats: oldData.stats.map((stat) =>
            stat.label.toLowerCase() === 'authors'
              ? { ...stat, value: stat.value + 1 }
              : stat,
          ),
        };
      });

      const heatmapKey =
        QueryKeys.workspaceKeys().dashboardHeatmap(workspaceSlug);
      const today = new Date().toISOString().split('T')[0];
      queryClient.setQueryData<DashboardHeatmapPayload>(
        heatmapKey,
        (oldData) => {
          if (!oldData) return oldData;
          const existingPointIndex = oldData.heatmap.findIndex(
            (point) => point.day === today,
          );
          if (existingPointIndex >= 0) {
            return {
              ...oldData,
              heatmap: oldData.heatmap.map((point) =>
                point.day === today
                  ? {
                      ...point,
                      authors: point.authors + 1,
                      activity: point.activity + 1,
                    }
                  : point,
              ),
            };
          } else {
            return {
              ...oldData,
              heatmap: [
                ...oldData.heatmap,
                {
                  day: today,
                  activity: 1,
                  posts: 0,
                  authors: 1,
                  categories: 0,
                  tags: 0,
                },
              ],
            };
          }
        },
      );
    },
    onError: (error, _v, ctx) => {
      const message = getErrorMessage(error, 'Failed to create author');
      toast.error(message);
      if (ctx?.previous)
        queryClient.setQueryData(authorsKey(workspaceSlug), ctx.previous);
    },
  });
}

export function useUpdateAuthor(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      authorId,
      data,
    }: {
      authorId: string;
      data: Partial<CreateAuthorData>;
    }) => apiUpdateAuthor(workspaceSlug, authorId, data),
    onMutate: async ({ authorId, data }) => {
      await queryClient.cancelQueries({
        queryKey: authorsKey(workspaceSlug),
      });
      const previous = queryClient.getQueryData<Author[]>(
        authorsKey(workspaceSlug),
      );
      queryClient.setQueryData(
        authorsKey(workspaceSlug),
        (old: Author[] | undefined) =>
          (old || []).map((a) =>
            a.id === authorId ? ({ ...a, ...data } as Author) : a,
          ),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Author updated');
    },
    onError: (error, _v, ctx) => {
      const message = getErrorMessage(error, 'Failed to update author');
      toast.error(message);
      if (ctx?.previous)
        queryClient.setQueryData(authorsKey(workspaceSlug), ctx.previous);
    },
  });
}

export function useDeleteAuthor(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (authorId: string) => apiDeleteAuthor(workspaceSlug, authorId),

    onMutate: async (authorId) => {
      await queryClient.cancelQueries({ queryKey: authorsKey(workspaceSlug) });
      const previous = queryClient.getQueryData<Author[]>(
        authorsKey(workspaceSlug),
      );
      queryClient.setQueryData(
        authorsKey(workspaceSlug),
        (old: Author[] | undefined) =>
          (old || []).filter((a) => a.id !== authorId),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Author deleted');

      const statsKey = QueryKeys.workspaceKeys().dashboardStats(workspaceSlug);
      queryClient.setQueryData<DashboardStatsPayload>(statsKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          stats: oldData.stats.map((stat) =>
            stat.label.toLowerCase() === 'authors' && stat.value > 0
              ? { ...stat, value: stat.value - 1 }
              : stat,
          ),
        };
      });

      const heatmapKey =
        QueryKeys.workspaceKeys().dashboardHeatmap(workspaceSlug);
      const today = new Date().toISOString().split('T')[0];
      queryClient.setQueryData<DashboardHeatmapPayload>(
        heatmapKey,
        (oldData) => {
          if (!oldData) return oldData;
          const existingPointIndex = oldData.heatmap.findIndex(
            (point) => point.day === today,
          );
          if (existingPointIndex >= 0) {
            return {
              ...oldData,
              heatmap: oldData.heatmap.map((point) =>
                point.day === today
                  ? {
                      ...point,
                      authors: Math.max(0, point.authors - 1),
                      activity: Math.max(0, point.activity - 1),
                    }
                  : point,
              ),
            };
          }
          return oldData;
        },
      );
    },
    onError: (error, _authorId, ctx) => {
      const message = getErrorMessage(error, 'Failed to delete author');
      toast.error(message);
      if (ctx?.previous) {
        queryClient.setQueryData(authorsKey(workspaceSlug), ctx.previous);
      }
    },
  });
}
