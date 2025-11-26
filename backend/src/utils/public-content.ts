import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  postsTable,
  postContentTable,
  postTagsTable,
  tagTable,
  categoryTable,
  authorTable,
} from '../db/schema';
import logger from '../logger';

type PostRecord = typeof postsTable.$inferSelect;
type AuthorRecord = typeof authorTable.$inferSelect;
type CategoryRecord = typeof categoryTable.$inferSelect;
type TagRecord = typeof tagTable.$inferSelect;
type PostTagRecord = typeof postTagsTable.$inferSelect & {
  tag: TagRecord | null;
};
type PostContentRecord = typeof postContentTable.$inferSelect;

export type PublicPostSummaryRecord = PostRecord & {
  author: AuthorRecord | null;
  category: CategoryRecord | null;
  postTags: PostTagRecord[];
};

export type PublicPostDetailRecord = PublicPostSummaryRecord & {
  content: PostContentRecord | null;
};

export type PublicPostsResult = {
  posts: PublicPostSummaryRecord[];
  total: number;
  offset: number;
  limit: number;
};

export async function getPublicPosts({
  workspaceId,
  offset,
  limit,
  categorySlug,
  tagSlugs,
  authorId,
}: {
  workspaceId: string;
  offset: number;
  limit: number;
  categorySlug?: string;
  tagSlugs?: string[];
  authorId?: string;
}): Promise<[Error | null, PublicPostsResult | null]> {
  try {
    const conditions = [
      eq(postsTable.workspaceId, workspaceId),
      eq(postsTable.visible, true),
    ];

    if (categorySlug) {
      conditions.push(eq(postsTable.categorySlug, categorySlug));
    }

    if (authorId) {
      conditions.push(eq(postsTable.authorId, authorId));
    }

    const posts = await db.query.postsTable.findMany({
      where: and(...conditions),
      with: {
        author: true,
        category: true,
        postTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (table, { desc, asc }) => [
        desc(table.publishedAt),
        desc(table.updatedAt),
        asc(table.slug),
      ],
    });

    let filtered = posts;
    if (tagSlugs && tagSlugs.length > 0) {
      const required = new Set(tagSlugs);
      filtered = posts.filter((post) => {
        const postTagSlugs = new Set(
          post.postTags.map((pt) => pt.tag?.slug ?? pt.tagSlug),
        );
        return Array.from(required).every((slug) => postTagSlugs.has(slug));
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return [
      null,
      {
        posts: paginated,
        total,
        offset,
        limit,
      },
    ];
  } catch (error) {
    logger.error(error, 'Error fetching public posts');
    return [error as Error, null];
  }
}

export async function getPublicPostBySlug({
  workspaceId,
  postSlug,
}: {
  workspaceId: string;
  postSlug: string;
}): Promise<[Error | null, PublicPostDetailRecord | null]> {
  try {
    const post = await db.query.postsTable.findFirst({
      where: and(
        eq(postsTable.workspaceId, workspaceId),
        eq(postsTable.slug, postSlug),
        eq(postsTable.visible, true),
      ),
      with: {
        author: true,
        category: true,
        content: true,
        postTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      return [null, null];
    }

    return [null, post];
  } catch (error) {
    logger.error(error, 'Error fetching public post');
    return [error as Error, null];
  }
}

export async function getPublicTags(
  workspaceId: string,
): Promise<[Error | null, Array<Pick<TagRecord, 'slug' | 'name'>> | null]> {
  try {
    const tags = await db.query.tagTable.findMany({
      where: eq(tagTable.workspaceId, workspaceId),
      columns: {
        slug: true,
        name: true,
      },
      orderBy: (table, { asc }) => [asc(table.name)],
    });
    return [null, tags];
  } catch (error) {
    logger.error(error, 'Error fetching public tags');
    return [error as Error, null];
  }
}

export async function getPublicCategories(
  workspaceId: string,
): Promise<
  [Error | null, Array<Pick<CategoryRecord, 'slug' | 'name'>> | null]
> {
  try {
    const categories = await db.query.categoryTable.findMany({
      where: eq(categoryTable.workspaceId, workspaceId),
      columns: {
        slug: true,
        name: true,
      },
      orderBy: (table, { asc }) => [asc(table.name)],
    });
    return [null, categories];
  } catch (error) {
    logger.error(error, 'Error fetching public categories');
    return [error as Error, null];
  }
}

export async function getPublicAuthors(workspaceId: string): Promise<
  [
    Error | null,
    Array<
      Pick<AuthorRecord, 'id' | 'name'> & {
        about: string | null;
        socialLinks: Record<string, unknown> | null;
      }
    > | null,
  ]
> {
  try {
    const rawAuthors = await db.query.authorTable.findMany({
      where: eq(authorTable.workspaceId, workspaceId),
      columns: {
        id: true,
        name: true,
        about: true,
        socialLinks: true,
      },
      orderBy: (table, { asc }) => [asc(table.name)],
    });

    const authors = rawAuthors.map((author) => ({
      id: author.id,
      name: author.name,
      about: author.about,
      socialLinks: (author.socialLinks ?? null) as Record<
        string,
        unknown
      > | null,
    }));

    return [null, authors];
  } catch (error) {
    logger.error(error, 'Error fetching public authors');
    return [error as Error, null];
  }
}

export async function getPublicStats(workspaceId: string): Promise<
  [
    Error | null,
    {
      totalPosts: number;
      totalAuthors: number;
      totalCategories: number;
      totalTags: number;
    } | null,
  ]
> {
  try {
    const [postsCount, authorsCount, categoriesCount, tagsCount] =
      await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(postsTable)
          .where(
            and(
              eq(postsTable.workspaceId, workspaceId),
              eq(postsTable.visible, true),
            ),
          ),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(authorTable)
          .where(eq(authorTable.workspaceId, workspaceId)),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(categoryTable)
          .where(eq(categoryTable.workspaceId, workspaceId)),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(tagTable)
          .where(eq(tagTable.workspaceId, workspaceId)),
      ]);

    return [
      null,
      {
        totalPosts: postsCount[0]?.count ?? 0,
        totalAuthors: authorsCount[0]?.count ?? 0,
        totalCategories: categoriesCount[0]?.count ?? 0,
        totalTags: tagsCount[0]?.count ?? 0,
      },
    ];
  } catch (error) {
    logger.error(error, 'Error fetching public stats');
    return [error as Error, null];
  }
}
