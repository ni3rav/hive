export type DashboardStatSummary = {
  label: string;
  value: number;
  href?: string;
};

export type DashboardRecentPost = {
  id: string;
  title: string;
  status: string;
  publishedAt: string;
  excerpt: string;
};

export type DashboardHeatmapPoint = {
  date: string;
  count: number;
};

export interface DashboardStatsPayload {
  workspaceName: string;
  userDisplayName: string;
  stats: DashboardStatSummary[];
  heatmap: DashboardHeatmapPoint[];
  recentPosts: DashboardRecentPost[];
  activitySummary?: string;
}
