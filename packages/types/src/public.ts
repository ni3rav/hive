export interface PublicTag {
  name: string;
  slug: string;
}

export interface PublicCategory {
  name: string;
  slug: string;
}

export interface PublicAuthor {
  id: string;
  name: string;
  about: string;
  socialLinks: Record<string, string>;
}

export interface PublicPostSummary {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  category: PublicCategory | null;
  tags: PublicTag[];
  author: PublicAuthor | null;
}

export interface PublicPostDetail extends PublicPostSummary {
  htmlContent: string;
}

export interface PublicPostListResponse {
  data: PublicPostSummary[];
  total: number;
  offset: number;
  limit: number;
}

export interface PublicStats {
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;
  totalTags: number;
}

export interface PostListFilters {
  offset?: number;
  limit?: number;
  category?: string;
  author?: string;
  tags?: string[];
}
