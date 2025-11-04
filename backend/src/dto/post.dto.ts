import { postsTable, postContentTable } from '../db/schema';

//* metadata only (for list endpoint)
export interface PostMetadataResponseDto {
  id: string;
  workspaceId: string;
  createdBy: string;
  authorId: string | null;
  title: string;
  slug: string;
  excerpt: string;
  categorySlug: string | null;
  status: string;
  visible: boolean;
  createdAt: Date;
  publishedAt: Date | null;
  updatedAt: Date;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  category?: {
    name: string;
    slug: string;
  } | null;
}

//* with content (for single post endpoint)
export interface PostWithContentResponseDto extends PostMetadataResponseDto {
  content: {
    id: string;
    contentHtml: string;
    contentJson: unknown;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    slug: string;
    name: string;
  }>;
}

export function toPostMetadataResponseDto(
  post: typeof postsTable.$inferSelect & {
    author?: {
      id: string;
      name: string;
      email: string;
    } | null;
    category?: {
      name: string;
      slug: string;
    } | null;
  },
): PostMetadataResponseDto {
  return {
    id: post.id,
    workspaceId: post.workspaceId,
    createdBy: post.createdBy,
    authorId: post.authorId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    categorySlug: post.categorySlug,
    status: post.status,
    visible: post.visible,
    createdAt: post.createdAt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    author: post.author
      ? {
          id: post.author.id,
          name: post.author.name,
          email: post.author.email,
        }
      : null,
    category: post.category
      ? {
          name: post.category.name,
          slug: post.category.slug,
        }
      : null,
  };
}

export function toPostMetadataListResponseDto(
  posts: Array<
    typeof postsTable.$inferSelect & {
      author?: {
        id: string;
        name: string;
        email: string;
      } | null;
      category?: {
        name: string;
        slug: string;
      } | null;
    }
  >,
): PostMetadataResponseDto[] {
  return posts.map(toPostMetadataResponseDto);
}

export function toPostWithContentResponseDto(
  post: typeof postsTable.$inferSelect & {
    content: typeof postContentTable.$inferSelect;
    author?: {
      id: string;
      name: string;
      email: string;
    } | null;
    category?: {
      name: string;
      slug: string;
    } | null;
    creator: {
      id: string;
      name: string;
      email: string;
    };
    postTags: Array<{
      tag: {
        slug: string;
        name: string;
      };
    }>;
  },
): PostWithContentResponseDto {
  return {
    ...toPostMetadataResponseDto(post),
    content: {
      id: post.content.id,
      contentHtml: post.content.contentHtml,
      contentJson: post.content.contentJson,
    },
    creator: {
      id: post.creator.id,
      name: post.creator.name,
      email: post.creator.email,
    },
    tags: post.postTags.map((pt) => ({
      slug: pt.tag.slug,
      name: pt.tag.name,
    })),
  };
}
