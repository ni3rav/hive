export const HIVE_BASE_URLS = [
  "https://api.hivecms.online/api/public",
] as const;
export type HiveBaseUrl = (typeof HIVE_BASE_URLS)[number];

export const HIVE_API_VERSIONS = ["v1"] as const;
export type HiveApiVersion = (typeof HIVE_API_VERSIONS)[number];

export type HiveClientOptions = {
  apiKey: string;
  baseUrl?: HiveBaseUrl | string;
  version?: HiveApiVersion | string;
  fetch?: typeof fetch;
};

export type PostListFilters = {
  offset?: number;
  limit?: number;
  category?: string;
  author?: string;
  tags?: string[];
};

export type PublicTag = {
  name: string;
  slug: string;
};

export type PublicCategory = {
  name: string;
  slug: string;
};

export type PublicAuthor = {
  id: string;
  name: string;
  about: string;
  socialLinks: Record<string, unknown>;
};

export type PublicPostSummary = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string | null;
  updatedAt: string | null;
  category: PublicCategory | null;
  tags: PublicTag[];
  author: {
    id: string;
    name: string;
  } | null;
};

export type PublicPostDetail = PublicPostSummary & {
  htmlContent: string;
};

export type PublicStats = {
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;
  totalTags: number;
};
