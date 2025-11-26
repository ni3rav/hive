import {
  PublicPostSummaryRecord,
  PublicPostDetailRecord,
} from '../utils/public-content';

type NullableDate = Date | null | undefined;

function toISOString(date: NullableDate) {
  return date ? new Date(date).toISOString() : null;
}

export type PublicTagDto = {
  name: string;
  slug: string;
};

export const toPublicTagListDto = (
  tags: Array<{ name: string; slug: string }>,
): PublicTagDto[] =>
  tags.map((tag) => ({
    name: tag.name,
    slug: tag.slug,
  }));

export type PublicCategoryDto = {
  name: string;
  slug: string;
};

export const toPublicCategoryListDto = (
  categories: Array<{ name: string; slug: string }>,
): PublicCategoryDto[] =>
  categories.map((category) => ({
    name: category.name,
    slug: category.slug,
  }));

export type PublicAuthorDto = {
  id: string;
  name: string;
  about: string;
  socialLinks: Record<string, unknown>;
};

export const toPublicAuthorListDto = (
  authors: Array<{
    id: string;
    name: string;
    about: string | null;
    socialLinks: Record<string, unknown> | null;
  }>,
): PublicAuthorDto[] =>
  authors.map((author) => ({
    id: author.id,
    name: author.name,
    about: author.about ?? '',
    socialLinks: author.socialLinks ?? {},
  }));

export type PublicPostSummaryDto = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string | null;
  updatedAt: string | null;
  category: PublicCategoryDto | null;
  tags: PublicTagDto[];
  author: {
    id: string;
    name: string;
  } | null;
};

export function toPublicPostSummaryDto(
  post: PublicPostSummaryRecord,
): PublicPostSummaryDto {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    publishedAt: toISOString(post.publishedAt ?? post.createdAt),
    updatedAt: toISOString(post.updatedAt),
    category: post.category
      ? {
          name: post.category.name,
          slug: post.category.slug,
        }
      : null,
    tags: post.postTags.map((postTag) => ({
      name: postTag.tag?.name ?? postTag.tagSlug,
      slug: postTag.tag?.slug ?? postTag.tagSlug,
    })),
    author: post.author
      ? {
          id: post.author.id,
          name: post.author.name,
        }
      : null,
  };
}

export type PublicPostDetailDto = PublicPostSummaryDto & {
  htmlContent: string;
};

export function toPublicPostDetailDto(
  post: PublicPostDetailRecord,
): PublicPostDetailDto {
  return {
    ...toPublicPostSummaryDto(post),
    htmlContent: post.content?.contentHtml ?? '',
  };
}

export type PublicPostsResponseDto = {
  data: PublicPostSummaryDto[];
  total: number;
  offset: number;
  limit: number;
};

export function toPublicPostsResponseDto(
  posts: PublicPostSummaryRecord[],
  total: number,
  offset: number,
  limit: number,
): PublicPostsResponseDto {
  return {
    data: posts.map((post) => toPublicPostSummaryDto(post)),
    total,
    offset,
    limit,
  };
}

export type PublicStatsDto = {
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;
  totalTags: number;
};

export const toPublicStatsDto = (stats: PublicStatsDto): PublicStatsDto => ({
  totalPosts: stats.totalPosts,
  totalAuthors: stats.totalAuthors,
  totalCategories: stats.totalCategories,
  totalTags: stats.totalTags,
});

