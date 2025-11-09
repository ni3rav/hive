import { db } from '../db';
import {
  postsTable,
  postContentTable,
  postTagsTable,
  workspacesTable,
  tagTable,
  authorTable,
  categoryTable,
} from '../db/schema';
import { and, eq, inArray } from 'drizzle-orm';
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
        creator: true,
        postTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
    });
    return [null, posts] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

//* get a single post with full content and relations
export async function getPostBySlugWithContent(
  postSlug: string,
  workspaceSlug: string,
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const post = await db.query.postsTable.findFirst({
      where: and(
        eq(postsTable.slug, postSlug),
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

    //* author exists in workspace
    if (data.authorId) {
      const author = await db.query.authorTable.findFirst({
        where: and(
          eq(authorTable.id, data.authorId),
          eq(authorTable.workspaceId, workspace.id),
        ),
      });
      if (!author) {
        throw new Error(
          'author not found or does not belong to this workspace',
        );
      }
    }

    //* category exists in workspace
    if (data.categorySlug) {
      const category = await db.query.categoryTable.findFirst({
        where: and(
          eq(categoryTable.slug, data.categorySlug),
          eq(categoryTable.workspaceId, workspace.id),
        ),
      });
      if (!category) {
        throw new Error(
          'category not found or does not belong to this workspace',
        );
      }
    }

    //* tags exist in workspace
    if (data.tagSlugs && data.tagSlugs.length > 0) {
      const existingTags = await db.query.tagTable.findMany({
        where: and(
          inArray(tagTable.slug, data.tagSlugs),
          eq(tagTable.workspaceId, workspace.id),
        ),
      });
      const existingTagSlugs = new Set(existingTags.map((t) => t.slug));
      const invalidTagSlugs = data.tagSlugs.filter(
        (slug) => !existingTagSlugs.has(slug),
      );
      if (invalidTagSlugs.length > 0) {
        throw new Error(
          `tags not found or do not belong to this workspace: ${invalidTagSlugs.join(', ')}`,
        );
      }
    }

    // sanitize html content
    const sanitizedHtml = sanitizePostHtml(data.contentHtml);

    // create post, content, and tag associations in transaction
    let result;
    try {
      result = await db.transaction(async (tx) => {
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
    } catch (error: unknown) {
      const dbError = error as {
        code?: string;
        constraint?: string;
        cause?: { code?: string; constraint?: string };
      };

      const errorCode = dbError.code || dbError.cause?.code;
      const errorConstraint = dbError.constraint || dbError.cause?.constraint;

      if (errorCode === '23505' && errorConstraint === 'posts_slug_unique') {
        throw new Error('post slug already exists in this workspace');
      }
      throw error;
    }

    // fetch post with relations for response
    const postWithRelations = await db.query.postsTable.findFirst({
      where: and(
        eq(postsTable.id, result.id),
        eq(postsTable.workspaceId, workspace.id),
      ),
      with: {
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

    if (!postWithRelations) {
      throw new Error('failed to fetch created post with relations');
    }

    return [null, postWithRelations] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

//* update a post with content and tags
export async function updatePost(
  postSlug: string,
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
        eq(postsTable.slug, postSlug),
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

    // validate author exists and belongs to workspace
    if (data.authorId) {
      const author = await db.query.authorTable.findFirst({
        where: and(
          eq(authorTable.id, data.authorId),
          eq(authorTable.workspaceId, workspace.id),
        ),
      });
      if (!author) {
        throw new Error(
          'author not found or does not belong to this workspace',
        );
      }
    }

    // validate category exists in workspace
    if (data.categorySlug) {
      const category = await db.query.categoryTable.findFirst({
        where: and(
          eq(categoryTable.slug, data.categorySlug),
          eq(categoryTable.workspaceId, workspace.id),
        ),
      });
      if (!category) {
        throw new Error(
          'category not found or does not belong to this workspace',
        );
      }
    }

    // validate tags exist in workspace
    if (data.tagSlugs !== undefined && data.tagSlugs.length > 0) {
      const existingTags = await db.query.tagTable.findMany({
        where: and(
          inArray(tagTable.slug, data.tagSlugs),
          eq(tagTable.workspaceId, workspace.id),
        ),
      });
      const existingTagSlugs = new Set(existingTags.map((t) => t.slug));
      const invalidTagSlugs = data.tagSlugs.filter(
        (slug) => !existingTagSlugs.has(slug),
      );
      if (invalidTagSlugs.length > 0) {
        throw new Error(
          `tags not found or do not belong to this workspace: ${invalidTagSlugs.join(', ')}`,
        );
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
            eq(postsTable.slug, postSlug),
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
          .where(eq(postContentTable.postId, updatedPost.id));
      }

      // update tags if provided
      if (data.tagSlugs !== undefined) {
        // remove old tags
        await tx
          .delete(postTagsTable)
          .where(eq(postTagsTable.postId, updatedPost.id));

        // add new tags
        if (data.tagSlugs.length > 0) {
          await tx.insert(postTagsTable).values(
            data.tagSlugs.map((tagSlug) => ({
              postId: updatedPost.id,
              tagSlug,
              workspaceId: workspace.id,
            })),
          );
        }
      }

      return updatedPost;
    });

    // fetch post with relations for response
    const postWithRelations = await db.query.postsTable.findFirst({
      where: and(
        eq(postsTable.id, result.id),
        eq(postsTable.workspaceId, workspace.id),
      ),
      with: {
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

    if (!postWithRelations) {
      throw new Error('failed to fetch updated post with relations');
    }

    return [null, postWithRelations] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

//* delete a post (cascade will delete content and tag associations)
export async function deletePost(postSlug: string, workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    const result = await db
      .delete(postsTable)
      .where(
        and(
          eq(postsTable.slug, postSlug),
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
