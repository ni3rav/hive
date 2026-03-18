import { HiveApiError } from "./internal/errors";
import {
  parseAuthorsResponse,
  parseCategoriesResponse,
  parsePostDetail,
  parsePostsListResponse,
  parseStatsResponse,
  parseTagsResponse,
} from "./internal/parsers";
import type {
  HiveClientOptions,
  PostListFilters,
  PublicAuthor,
  PublicCategory,
  PublicPostDetail,
  PublicPostSummary,
  PublicStats,
  PublicTag,
} from "./internal/types";

const DEFAULT_BASE_URL = "https://api.hivecms.online/api/public";
const DEFAULT_VERSION = "v1";

let hasWarnedBrowserUsage = false;

function warnIfBrowserRuntime() {
  const isBrowser =
    typeof window !== "undefined" || typeof document !== "undefined";

  if (!isBrowser || hasWarnedBrowserUsage) {
    return;
  }

  hasWarnedBrowserUsage = true;
  console.warn(
    "[hive-cms] Browser runtime detected. This SDK is intended for server-side usage only. Avoid exposing API keys in frontend code.",
  );
}

function trimTrailingSlash(input: string) {
  return input.replace(/\/+$/, "");
}

function toSearchParams(filters: PostListFilters) {
  const params = new URLSearchParams();

  if (typeof filters.offset === "number") {
    params.set("offset", String(filters.offset));
  }
  if (typeof filters.limit === "number") {
    params.set("limit", String(filters.limit));
  }
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.author) {
    params.set("author", filters.author);
  }
  if (filters.tags && filters.tags.length > 0) {
    params.set("tags", filters.tags.join(","));
  }

  return params;
}

type ApiErrorPayload = {
  message?: string;
  code?: string;
  details?: unknown;
};

export class Hive {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly version: string;
  private readonly fetchImpl: typeof fetch;

  public readonly posts: {
    list: (filters?: PostListFilters) => Promise<{
      data: PublicPostSummary[];
      total: number;
      offset: number;
      limit: number;
    }>;
    get: (postSlug: string) => Promise<PublicPostDetail>;
  };

  public readonly tags: {
    list: () => Promise<PublicTag[]>;
  };

  public readonly categories: {
    list: () => Promise<PublicCategory[]>;
  };

  public readonly authors: {
    list: () => Promise<PublicAuthor[]>;
  };

  public readonly stats: {
    get: () => Promise<PublicStats>;
  };

  constructor(options: HiveClientOptions) {
    warnIfBrowserRuntime();

    if (!options.apiKey || options.apiKey.trim().length === 0) {
      throw new HiveApiError("apiKey is required", 400, "INVALID_SDK_CONFIG");
    }

    this.apiKey = options.apiKey;
    this.baseUrl = trimTrailingSlash(options.baseUrl ?? DEFAULT_BASE_URL);
    this.version = options.version ?? DEFAULT_VERSION;
    this.fetchImpl = options.fetch ?? fetch;

    this.posts = {
      list: async (filters: PostListFilters = {}) => {
        const params = toSearchParams(filters);
        const query = params.toString();
        const path = query ? `/posts?${query}` : "/posts";

        const payload = await this.request(path);
        return parsePostsListResponse(payload);
      },
      get: async (postSlug: string) => {
        if (!postSlug || postSlug.trim().length === 0) {
          throw new HiveApiError(
            "postSlug is required",
            400,
            "INVALID_SDK_CONFIG",
          );
        }
        const payload = await this.request(
          `/posts/${encodeURIComponent(postSlug)}`,
        );
        return parsePostDetail(payload);
      },
    };

    this.tags = {
      list: async () => {
        const payload = await this.request("/tags");
        return parseTagsResponse(payload);
      },
    };

    this.categories = {
      list: async () => {
        const payload = await this.request("/categories");
        return parseCategoriesResponse(payload);
      },
    };

    this.authors = {
      list: async () => {
        const payload = await this.request("/authors");
        return parseAuthorsResponse(payload);
      },
    };

    this.stats = {
      get: async () => {
        const payload = await this.request("/stats");
        return parseStatsResponse(payload);
      },
    };
  }

  private endpoint(path: string) {
    return `${this.baseUrl}/${this.version}/${encodeURIComponent(this.apiKey)}${path}`;
  }

  private async request(path: string): Promise<unknown> {
    const response = await this.fetchImpl(this.endpoint(path), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const payload = (await response.json().catch(() => undefined)) as
      | ApiErrorPayload
      | undefined;

    if (!response.ok) {
      const errorPayload = (payload ?? {}) as ApiErrorPayload;
      throw new HiveApiError(
        errorPayload.message ?? `Request failed with status ${response.status}`,
        response.status,
        errorPayload.code ?? "API_REQUEST_FAILED",
        errorPayload.details,
      );
    }

    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      (payload as { success?: boolean }).success === false
    ) {
      const errorPayload = payload as ApiErrorPayload;
      throw new HiveApiError(
        errorPayload.message ?? "Request failed",
        response.status,
        errorPayload.code ?? "API_REQUEST_FAILED",
        errorPayload.details,
      );
    }

    return payload;
  }
}

export type {
  HiveClientOptions,
  PostListFilters,
  PublicAuthor,
  PublicCategory,
  PublicPostDetail,
  PublicPostSummary,
  PublicStats,
  PublicTag,
} from "./internal/types";
export { HiveApiError } from "./internal/errors";
