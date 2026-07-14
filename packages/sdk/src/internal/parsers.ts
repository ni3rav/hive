import { HiveApiError } from "./errors";
import type {
  PublicAuthor,
  PublicCategory,
  PublicPostDetail,
  PublicPostListResponse,
  PublicPostSummary,
  PublicStats,
  PublicTag,
} from "./types";

type UnknownRecord = Record<string, unknown>;

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asObject(value: unknown, context: string): UnknownRecord {
  if (!isObject(value)) {
    throw new HiveApiError(
      `Invalid response: ${context} must be an object`,
      502,
      "INVALID_API_RESPONSE",
    );
  }
  return value;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new HiveApiError(
      `Invalid response: ${field} must be a string`,
      502,
      "INVALID_API_RESPONSE",
    );
  }
  return value;
}

function asNullableString(value: unknown, field: string): string | null {
  if (value === null) {
    return null;
  }
  return asString(value, field);
}

function asNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new HiveApiError(
      `Invalid response: ${field} must be a number`,
      502,
      "INVALID_API_RESPONSE",
    );
  }
  return value;
}

function asArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new HiveApiError(
      `Invalid response: ${field} must be an array`,
      502,
      "INVALID_API_RESPONSE",
    );
  }
  return value;
}

function parseTag(value: unknown, context: string): PublicTag {
  const object = asObject(value, context);
  return {
    name: asString(object.name, `${context}.name`),
    slug: asString(object.slug, `${context}.slug`),
  };
}

function parseCategory(value: unknown, context: string): PublicCategory {
  const object = asObject(value, context);
  return {
    name: asString(object.name, `${context}.name`),
    slug: asString(object.slug, `${context}.slug`),
  };
}

function parseAuthorSummary(
  value: unknown,
  context: string,
): { id: string; name: string } {
  const object = asObject(value, context);
  return {
    id: asString(object.id, `${context}.id`),
    name: asString(object.name, `${context}.name`),
  };
}

function parsePostSummary(value: unknown, context: string): PublicPostSummary {
  const object = asObject(value, context);

  const rawCategory = object.category;
  const rawAuthor = object.author;

  return {
    title: asString(object.title, `${context}.title`),
    slug: asString(object.slug, `${context}.slug`),
    excerpt: asString(object.excerpt, `${context}.excerpt`),
    publishedAt: asNullableString(object.publishedAt, `${context}.publishedAt`),
    updatedAt: asNullableString(object.updatedAt, `${context}.updatedAt`),
    category:
      rawCategory === null
        ? null
        : parseCategory(rawCategory, `${context}.category`),
    tags: asArray(object.tags, `${context}.tags`).map((item, index) =>
      parseTag(item, `${context}.tags[${index}]`),
    ),
    author:
      rawAuthor === null
        ? null
        : parseAuthorSummary(rawAuthor, `${context}.author`),
  };
}

export function parsePostsListResponse(value: unknown): PublicPostListResponse {
  const object = asObject(value, "posts.list response");

  return {
    data: asArray(object.data, "posts.list.data").map((item, index) =>
      parsePostSummary(item, `posts.list.data[${index}]`),
    ),
    total: asNumber(object.total, "posts.list.total"),
    offset: asNumber(object.offset, "posts.list.offset"),
    limit: asNumber(object.limit, "posts.list.limit"),
  };
}

export function parsePostDetail(value: unknown): PublicPostDetail {
  const summary = parsePostSummary(value, "posts.get");
  const object = asObject(value, "posts.get response");

  return {
    ...summary,
    htmlContent: asString(object.htmlContent, "posts.get.htmlContent"),
  };
}

export function parseTagsResponse(value: unknown): PublicTag[] {
  const object = asObject(value, "tags.list response");
  return asArray(object.data, "tags.list.data").map((item, index) =>
    parseTag(item, `tags.list.data[${index}]`),
  );
}

export function parseCategoriesResponse(value: unknown): PublicCategory[] {
  const object = asObject(value, "categories.list response");
  return asArray(object.data, "categories.list.data").map((item, index) =>
    parseCategory(item, `categories.list.data[${index}]`),
  );
}

export function parseAuthorsResponse(value: unknown): PublicAuthor[] {
  const object = asObject(value, "authors.list response");

  return asArray(object.data, "authors.list.data").map((item, index) => {
    const author = asObject(item, `authors.list.data[${index}]`);
    const socialLinks = author.socialLinks;

    if (!isObject(socialLinks)) {
      throw new HiveApiError(
        "Invalid response: authors.list.socialLinks must be an object",
        502,
        "INVALID_API_RESPONSE",
      );
    }

    const socialLinksEntries = Object.entries(socialLinks);
    const typedSocialLinks: Record<string, string> = {};

    for (const [key, value] of socialLinksEntries) {
      typedSocialLinks[key] = asString(
        value,
        `authors.list.data[${index}].socialLinks.${key}`,
      );
    }

    return {
      id: asString(author.id, `authors.list.data[${index}].id`),
      name: asString(author.name, `authors.list.data[${index}].name`),
      about: asString(author.about, `authors.list.data[${index}].about`),
      socialLinks: typedSocialLinks,
    };
  });
}

export function parseStatsResponse(value: unknown): PublicStats {
  const object = asObject(value, "stats.get response");

  return {
    totalPosts: asNumber(object.totalPosts, "stats.get.totalPosts"),
    totalAuthors: asNumber(object.totalAuthors, "stats.get.totalAuthors"),
    totalCategories: asNumber(
      object.totalCategories,
      "stats.get.totalCategories",
    ),
    totalTags: asNumber(object.totalTags, "stats.get.totalTags"),
  };
}
