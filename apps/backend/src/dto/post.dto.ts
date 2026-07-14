import { postsTable, postContentTable } from '../db/schema';

//* metadata only (for list endpoint)
export interface PostMetadataResponseDto {
  id: string;
  workspaceId: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  visible: boolean;
  createdAt: string;
  publishedAt: string | null;
  updatedAt: string;
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
  tags: Array<{
    slug: string;
    name: string;
  }>;
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
    creator: {
      id: string;
      name: string;
      email: string;
    };
    postTags: Array<{
      tag: {
        slug: string;
        name: string;
      } | null;
    }>;
  },
): PostMetadataResponseDto {
  return {
    id: post.id,
    workspaceId: post.workspaceId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    status: post.status,
    visible: post.visible,
    createdAt: post.createdAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
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
    creator: {
      id: post.creator.id,
      name: post.creator.name,
      email: post.creator.email,
    },
    tags: post.postTags
      .filter((pt) => pt.tag !== null)
      .map((pt) => ({
        slug: pt.tag!.slug,
        name: pt.tag!.name,
      })),
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
      creator: {
        id: string;
        name: string;
        email: string;
      };
      postTags: Array<{
        tag: {
          slug: string;
          name: string;
        } | null;
      }>;
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
      } | null;
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
    tags: post.postTags
      .filter((pt) => pt.tag !== null)
      .map((pt) => ({
        slug: pt.tag!.slug,
        name: pt.tag!.name,
      })),
  };
}
