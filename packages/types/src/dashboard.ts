export interface DashboardStatSummary {
  label: string;
  value: number;
  href?: string;
}

export interface DashboardRecentPost {
  id: string;
  title: string;
  status: string;
  publishedAt: string;
  excerpt: string;
}

export interface DashboardHeatmapPoint {
  day: string;
  activity: number;
  posts: number;
  authors: number;
  categories: number;
  tags: number;
}

export interface DashboardStatsPayload {
  workspaceName: string;
  userDisplayName: string;
  stats: DashboardStatSummary[];
  recentPosts: DashboardRecentPost[];
}

export interface DashboardHeatmapPayload {
  heatmap: DashboardHeatmapPoint[];
}
