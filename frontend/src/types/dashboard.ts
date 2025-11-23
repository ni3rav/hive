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
  day: string;
  activity: number;
  posts: number;
  authors: number;
  categories: number;
  tags: number;
};

export interface DashboardStatsPayload {
  workspaceName: string;
  userDisplayName: string;
  stats: DashboardStatSummary[];
  recentPosts: DashboardRecentPost[];
}

export interface DashboardHeatmapPayload {
  heatmap: DashboardHeatmapPoint[];
  activitySummary: string;
}
