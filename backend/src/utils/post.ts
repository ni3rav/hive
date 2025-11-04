import { db } from '../db';
import {
  postsTable,
  postContentTable,
  postTagsTable,
  workspacesTable,
} from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { sanitizePostHtml } from './sanitize';

async function getWorkspaceBySlug(workspaceSlug: string) {
  const workspace = await db.query.workspacesTable.findFirst({
    where: eq(workspacesTable.slug, workspaceSlug),
  });

  if (!workspace) {
    throw new Error('workspace not found');
  }

  return workspace;
}

//* metadata of posts in  a workspace
export async function getPostsByWorkspaceSlug(workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const posts = await db.query.postsTable.findMany({
      where: eq(postsTable.workspaceId, workspace.id),
      with: {
        author: true,
        category: true,
      },
      orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
    });
    return [null, posts] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

//* get a single post with full content and relations
export async function getPostByIdWithContent(
  postId: string,
  workspaceSlug: string,
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const post = await db.query.postsTable.findFirst({
      where: and(
        eq(postsTable.id, postId),
        eq(postsTable.workspaceId, workspace.id),
      ),
      with: {
        content: true,
        author: true,
        category: true,
        creator: true,
        postTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('post not found');
    }

    return [null, post] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

//* create a new post with content and tags
export async function createPost(
  workspaceSlug: string,
  userId: string,
  data: {
    title: string;
    slug: string;
    excerpt: string;
    authorId?: string;
    categorySlug?: string;
    tagSlugs: string[];
    status: string;
    visible: boolean;
    contentHtml: string;
    contentJson: unknown;
    publishedAt?: Date;
  },
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    // check if slug already exists in workspace
    const existingPost = await db.query.postsTable.findFirst({
      where: and(
        eq(postsTable.slug, data.slug),
        eq(postsTable.workspaceId, workspace.id),
      ),
    });

    if (existingPost) {
      throw new Error('post slug already exists in this workspace');
    }

    // sanitize html content
    const sanitizedHtml = sanitizePostHtml(data.contentHtml);

    // create post, content, and tag associations in transaction
    const result = await db.transaction(async (tx) => {
      // create post
      const [post] = await tx
        .insert(postsTable)
        .values({
          workspaceId: workspace.id,
          createdBy: userId,
          authorId: data.authorId,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          categorySlug: data.categorySlug,
          status: data.status,
          visible: data.visible,
          publishedAt: data.publishedAt,
        })
        .returning();

      // create post content
      await tx.insert(postContentTable).values({
        postId: post.id,
        contentHtml: sanitizedHtml,
        contentJson: data.contentJson,
      });

      // create tag associations
      if (data.tagSlugs && data.tagSlugs.length > 0) {
        await tx.insert(postTagsTable).values(
          data.tagSlugs.map((tagSlug) => ({
            postId: post.id,
            tagSlug,
            workspaceId: workspace.id,
          })),
        );
      }

      return post;
    });

    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

//* update a post with content and tags
export async function updatePost(
  postId: string,
  workspaceSlug: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    authorId?: string;
    categorySlug?: string;
    tagSlugs?: string[];
    status?: string;
    visible?: boolean;
    contentHtml?: string;
    contentJson?: unknown;
    publishedAt?: Date;
  },
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    // check if post exists
    const existingPost = await db.query.postsTable.findFirst({
      where: and(
        eq(postsTable.id, postId),
        eq(postsTable.workspaceId, workspace.id),
      ),
    });

    if (!existingPost) {
      throw new Error('post not found');
    }

    // check slug uniqueness if slug is being updated
    if (data.slug && data.slug !== existingPost.slug) {
      const duplicatePost = await db.query.postsTable.findFirst({
        where: and(
          eq(postsTable.slug, data.slug),
          eq(postsTable.workspaceId, workspace.id),
        ),
      });

      if (duplicatePost) {
        throw new Error('post slug already exists in this workspace');
      }
    }

    // sanitize html if provided
    const sanitizedHtml = data.contentHtml
      ? sanitizePostHtml(data.contentHtml)
      : undefined;

    // update post, content, and tags in transaction
    const result = await db.transaction(async (tx) => {
      // update post metadata
      const [updatedPost] = await tx
        .update(postsTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(postsTable.id, postId),
            eq(postsTable.workspaceId, workspace.id),
          ),
        )
        .returning();

      // update content if provided
      if (sanitizedHtml && data.contentJson) {
        await tx
          .update(postContentTable)
          .set({
            contentHtml: sanitizedHtml,
            contentJson: data.contentJson,
          })
          .where(eq(postContentTable.postId, postId));
      }

      // update tags if provided
      if (data.tagSlugs !== undefined) {
        // remove old tags
        await tx.delete(postTagsTable).where(eq(postTagsTable.postId, postId));

        // add new tags
        if (data.tagSlugs.length > 0) {
          await tx.insert(postTagsTable).values(
            data.tagSlugs.map((tagSlug) => ({
              postId,
              tagSlug,
              workspaceId: workspace.id,
            })),
          );
        }
      }

      return updatedPost;
    });

    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

//* delete a post (cascade will delete content and tag associations)
export async function deletePost(postId: string, workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    const result = await db
      .delete(postsTable)
      .where(
        and(
          eq(postsTable.id, postId),
          eq(postsTable.workspaceId, workspace.id),
        ),
      );

    if (result.rowCount === 0) {
      return [new Error('post not found or already deleted'), null] as const;
    }

    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}
