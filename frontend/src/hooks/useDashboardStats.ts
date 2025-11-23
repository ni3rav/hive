import { useQuery } from '@tanstack/react-query';
import { apiGetDashboardStats } from '@/api/workspace';
import { QueryKeys } from '@/lib/query-key-factory';
import type { DashboardStatsPayload } from '@/types/dashboard';

export function useDashboardStats(workspaceSlug?: string) {
  return useQuery<DashboardStatsPayload>({
    queryKey: QueryKeys.workspaceKeys().dashboardStats(
      workspaceSlug ?? 'unselected',
    ),
    queryFn: () => apiGetDashboardStats(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}
