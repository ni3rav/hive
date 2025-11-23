export interface DashboardStatSummaryDto {
  label: string;
  value: number;
}

export interface DashboardRecentPostDto {
  id: string;
  title: string;
  status: string;
  publishedAt: string;
  excerpt: string;
}

export interface DashboardStatsResponseDto {
  workspaceName: string;
  userDisplayName: string;
  stats: DashboardStatSummaryDto[];
  recentPosts: DashboardRecentPostDto[];
}

export interface DashboardHeatmapPointDto {
  day: string;
  activity: number;
  posts: number;
  authors: number;
  categories: number;
  tags: number;
}

export interface DashboardHeatmapResponseDto {
  heatmap: DashboardHeatmapPointDto[];
  activitySummary: string;
}

export function toDashboardStatsResponseDto(data: {
  workspaceName: string;
  stats: Array<{ label: string; value: number }>;
  recentPosts: Array<{
    id: string;
    title: string;
    status: string;
    publishedAt: string;
    excerpt: string;
  }>;
  userDisplayName: string;
}): DashboardStatsResponseDto {
  return {
    workspaceName: data.workspaceName,
    userDisplayName: data.userDisplayName,
    stats: data.stats.map((stat) => ({
      label: stat.label,
      value: stat.value,
    })),
    recentPosts: data.recentPosts.map((post) => ({
      id: post.id,
      title: post.title,
      status: post.status,
      publishedAt: post.publishedAt,
      excerpt: post.excerpt,
    })),
  };
}

export function toDashboardHeatmapResponseDto(data: {
  heatmap: Array<{
    day: string;
    activity: number;
    posts: number;
    authors: number;
    categories: number;
    tags: number;
  }>;
  activitySummary: string;
}): DashboardHeatmapResponseDto {
  return {
    heatmap: data.heatmap.map((point) => ({
      day: point.day,
      activity: point.activity,
      posts: point.posts,
      authors: point.authors,
      categories: point.categories,
      tags: point.tags,
    })),
    activitySummary: data.activitySummary,
  };
}

