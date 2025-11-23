import { db } from '../db';
import { UserWorkspace } from '../types/workspaces';
import {
  workspacesTable,
  postsTable,
  authorTable,
  categoryTable,
  tagTable,
} from '../db/schema';
import { eq, and, sql, gte } from 'drizzle-orm';
import logger from '../logger';

export async function checkSlugExists(slug: string): Promise<boolean> {
  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, slug),
    });
    return !!workspace;
  } catch (error) {
    logger.error(error, 'Error checking slug existence');
    throw error;
  }
}

export async function getUserWorkspaces(
  userId: string,
): Promise<[Error, null] | [null, UserWorkspace[]]> {
  try {
    const query = await db.query.workspaceUsersTable.findMany({
      where: (workspaceUsers, { eq }) => eq(workspaceUsers.userId, userId),
      with: {
        workspace: true,
      },
    });
    const userWorkspaces = query.map((item) => {
      return { ...item.workspace, role: item.role, joinedAt: item.joinedAt };
    });
    return [null, userWorkspaces];
  } catch (error) {
    logger.error(error, 'Error in getUserWorkspace util');
    return [new Error('ERROR WHILE GETTING USER WORKSPACE'), null];
  }
}

export async function updateWorkspace(
  workspaceSlug: string,
  data: { name: string },
) {
  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, workspaceSlug),
    });

    if (!workspace) {
      throw new Error('workspace not found');
    }

    const [updatedWorkspace] = await db
      .update(workspacesTable)
      .set({ name: data.name })
      .where(eq(workspacesTable.slug, workspaceSlug))
      .returning();

    return [null, updatedWorkspace] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function deleteWorkspace(workspaceSlug: string, userId: string) {
  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, workspaceSlug),
    });

    if (!workspace) {
      throw new Error('workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new Error('only owner can delete workspace');
    }

    const result = await db
      .delete(workspacesTable)
      .where(eq(workspacesTable.slug, workspaceSlug));

    if (result.rowCount === 0) {
      return [
        new Error('workspace not found or already deleted'),
        null,
      ] as const;
    }

    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function getDashboardStats(workspaceSlug: string) {
  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, workspaceSlug),
    });

    if (!workspace) {
      throw new Error('workspace not found');
    }

    const [
      totalPostsResult,
      authorsCountResult,
      categoriesCountResult,
      tagsCountResult,
    ] = await Promise.allSettled([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(postsTable)
        .where(eq(postsTable.workspaceId, workspace.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(authorTable)
        .where(eq(authorTable.workspaceId, workspace.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(categoryTable)
        .where(eq(categoryTable.workspaceId, workspace.id)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tagTable)
        .where(eq(tagTable.workspaceId, workspace.id)),
    ]);

    const totalPosts =
      totalPostsResult.status === 'fulfilled' ? totalPostsResult.value : [];
    const authorsCount =
      authorsCountResult.status === 'fulfilled' ? authorsCountResult.value : [];
    const categoriesCount =
      categoriesCountResult.status === 'fulfilled'
        ? categoriesCountResult.value
        : [];
    const tagsCount =
      tagsCountResult.status === 'fulfilled' ? tagsCountResult.value : [];

    const recentPosts = await db.query.postsTable.findMany({
      where: eq(postsTable.workspaceId, workspace.id),
      orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
      limit: 5,
      columns: {
        id: true,
        title: true,
        status: true,
        publishedAt: true,
        excerpt: true,
      },
    });

    const stats = [
      {
        label: 'Total Posts',
        value: totalPosts[0]?.count ?? 0,
      },
      {
        label: 'Authors',
        value: authorsCount[0]?.count ?? 0,
      },
      {
        label: 'Categories',
        value: categoriesCount[0]?.count ?? 0,
      },
      {
        label: 'Tags',
        value: tagsCount[0]?.count ?? 0,
      },
    ];

    const recentPostsFormatted = recentPosts.map((post) => ({
      id: post.id,
      title: post.title,
      status: post.status,
      publishedAt: post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString()
        : 'Not published',
      excerpt: post.excerpt || '',
    }));

    return [
      null,
      {
        workspaceName: workspace.name,
        stats,
        recentPosts: recentPostsFormatted,
      },
    ] as const;
  } catch (error) {
    logger.error(error, 'Error in getDashboardStats');
    return [error, null] as const;
  }
}

export async function getDashboardHeatmap(workspaceSlug: string) {
  try {
    const workspace = await db.query.workspacesTable.findFirst({
      where: eq(workspacesTable.slug, workspaceSlug),
    });

    if (!workspace) {
      throw new Error('workspace not found');
    }

    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const fifteenDaysAgo = new Date(todayUTC);
    fifteenDaysAgo.setUTCDate(fifteenDaysAgo.getUTCDate() - 14);

    const [postsResult, authorsResult, categoriesResult, tagsResult] =
      await Promise.allSettled([
        db
          .select({
            date: sql<string>`to_char(date_trunc('day', ${postsTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
            count: sql<number>`count(*)::int`,
          })
          .from(postsTable)
          .where(
            and(
              eq(postsTable.workspaceId, workspace.id),
              gte(postsTable.createdAt, fifteenDaysAgo),
            ),
          )
          .groupBy(
            sql`to_char(date_trunc('day', ${postsTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
          ),
        db
          .select({
            date: sql<string>`to_char(date_trunc('day', ${authorTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
            count: sql<number>`count(*)::int`,
          })
          .from(authorTable)
          .where(
            and(
              eq(authorTable.workspaceId, workspace.id),
              gte(authorTable.createdAt, fifteenDaysAgo),
            ),
          )
          .groupBy(
            sql`to_char(date_trunc('day', ${authorTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
          ),
        db
          .select({
            date: sql<string>`to_char(date_trunc('day', ${categoryTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
            count: sql<number>`count(*)::int`,
          })
          .from(categoryTable)
          .where(
            and(
              eq(categoryTable.workspaceId, workspace.id),
              gte(categoryTable.createdAt, fifteenDaysAgo),
            ),
          )
          .groupBy(
            sql`to_char(date_trunc('day', ${categoryTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
          ),
        db
          .select({
            date: sql<string>`to_char(date_trunc('day', ${tagTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
            count: sql<number>`count(*)::int`,
          })
          .from(tagTable)
          .where(
            and(
              eq(tagTable.workspaceId, workspace.id),
              gte(tagTable.createdAt, fifteenDaysAgo),
            ),
          )
          .groupBy(
            sql`to_char(date_trunc('day', ${tagTable.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
          ),
      ]);

    const postsData =
      postsResult.status === 'fulfilled' ? postsResult.value : [];
    const authorsData =
      authorsResult.status === 'fulfilled' ? authorsResult.value : [];
    const categoriesData =
      categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
    const tagsData = tagsResult.status === 'fulfilled' ? tagsResult.value : [];

    const allDates: string[] = [];
    for (let i = 0; i < 15; i++) {
      const date = new Date(fifteenDaysAgo);
      date.setUTCDate(fifteenDaysAgo.getUTCDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      allDates.push(dateStr);
    }

    const postsMap = new Map<string, number>();
    const authorsMap = new Map<string, number>();
    const categoriesMap = new Map<string, number>();
    const tagsMap = new Map<string, number>();

    const addToEntityMap = (
      items: Array<{ date: string; count: number }>,
      map: Map<string, number>,
    ) => {
      for (const item of items) {
        map.set(item.date, item.count);
      }
    };

    addToEntityMap(postsData, postsMap);
    addToEntityMap(authorsData, authorsMap);
    addToEntityMap(categoriesData, categoriesMap);
    addToEntityMap(tagsData, tagsMap);

    const heatmap = allDates.map((dateStr) => {
      const date = new Date(dateStr);
      const day = date.toLocaleDateString('en-US', {
        weekday: 'short',
      });
      const posts = postsMap.get(dateStr) || 0;
      const authors = authorsMap.get(dateStr) || 0;
      const categories = categoriesMap.get(dateStr) || 0;
      const tags = tagsMap.get(dateStr) || 0;
      const activity = posts + authors + categories + tags;

      return {
        day,
        activity,
        posts,
        authors,
        categories,
        tags,
      };
    });

    return [
      null,
      {
        heatmap,
      },
    ] as const;
  } catch (error) {
    logger.error(error, 'Error in getDashboardHeatmap');
    return [error, null] as const;
  }
}
