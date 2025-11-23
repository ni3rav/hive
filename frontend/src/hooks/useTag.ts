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
import type {
  DashboardStatsPayload,
  DashboardHeatmapPayload,
} from '@/types/dashboard';

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

      const statsKey = QueryKeys.workspaceKeys().dashboardStats(workspaceSlug);
      queryClient.setQueryData<DashboardStatsPayload>(statsKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          stats: oldData.stats.map((stat) =>
            stat.label.toLowerCase() === 'tags'
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
                      tags: point.tags + 1,
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
                  authors: 0,
                  categories: 0,
                  tags: 1,
                },
              ],
            };
          }
        },
      );
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

      const statsKey = QueryKeys.workspaceKeys().dashboardStats(workspaceSlug);
      queryClient.setQueryData<DashboardStatsPayload>(statsKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          stats: oldData.stats.map((stat) =>
            stat.label.toLowerCase() === 'tags' && stat.value > 0
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
                      tags: Math.max(0, point.tags - 1),
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
  });
}
