import { useQuery } from '@tanstack/react-query';
import { apiGetDashboardHeatmap } from '@/api/workspace';
import { QueryKeys } from '@/lib/query-key-factory';
import type { DashboardHeatmapPayload } from '@/types/dashboard';

export function useDashboardHeatmap(workspaceSlug?: string) {
  return useQuery<DashboardHeatmapPayload>({
    queryKey: QueryKeys.workspaceKeys().dashboardHeatmap(
      workspaceSlug ?? 'unselected',
    ),
    queryFn: () => apiGetDashboardHeatmap(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
    staleTime: 1000 * 60 * 15,
  });
}

