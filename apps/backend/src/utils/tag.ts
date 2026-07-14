import { db } from '../db';
import { tagTable, postTagsTable } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { getWorkspaceBySlug } from './workspace';

export async function getTagsByWorkspaceSlug(workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const result = await db.query.tagTable.findMany({
      where: eq(tagTable.workspaceId, workspace.id),
    });
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function createTag(
  workspaceSlug: string,
  data: {
    name: string;
    slug: string;
  },
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    // check if slug already exists in this workspace
    const existingTag = await db.query.tagTable.findFirst({
      where: and(
        eq(tagTable.slug, data.slug),
        eq(tagTable.workspaceId, workspace.id),
      ),
    });

    if (existingTag) {
      throw new Error('tag slug already exists in this workspace');
    }

    const [tag] = await db
      .insert(tagTable)
      .values({
        workspaceId: workspace.id,
        name: data.name,
        slug: data.slug,
      })
      .returning();

    return [null, tag] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function updateTag(
  tagSlug: string,
  workspaceSlug: string,
  data: {
    name?: string;
    slug?: string;
  },
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    // check if tag exists
    const existingTag = await db.query.tagTable.findFirst({
      where: and(
        eq(tagTable.slug, tagSlug),
        eq(tagTable.workspaceId, workspace.id),
      ),
    });

    if (!existingTag) {
      throw new Error('tag not found');
    }

    // check uniqueness of slug when updated
    if (data.slug && data.slug !== tagSlug) {
      const duplicateTag = await db.query.tagTable.findFirst({
        where: and(
          eq(tagTable.slug, data.slug),
          eq(tagTable.workspaceId, workspace.id),
        ),
      });

      if (duplicateTag) {
        throw new Error('tag slug already exists in this workspace');
      }

      // update tag and all related post_tags in a transaction
      const result = await db.transaction(async (tx) => {
        // tag
        const [updatedTag] = await tx
          .update(tagTable)
          .set(data)
          .where(
            and(
              eq(tagTable.slug, tagSlug),
              eq(tagTable.workspaceId, workspace.id),
            ),
          )
          .returning();

        // update all post_tags referencing this tag
        await tx
          .update(postTagsTable)
          .set({ tagSlug: data.slug })
          .where(
            and(
              eq(postTagsTable.tagSlug, tagSlug),
              eq(postTagsTable.workspaceId, workspace.id),
            ),
          );

        return updatedTag;
      });

      return [null, result] as const;
    } else {
      // name update, no slug change
      const [result] = await db
        .update(tagTable)
        .set(data)
        .where(
          and(
            eq(tagTable.slug, tagSlug),
            eq(tagTable.workspaceId, workspace.id),
          ),
        )
        .returning();

      return [null, result] as const;
    }
  } catch (error) {
    return [error, null] as const;
  }
}

export async function deleteTag(tagSlug: string, workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const result = await db
      .delete(tagTable)
      .where(
        and(eq(tagTable.slug, tagSlug), eq(tagTable.workspaceId, workspace.id)),
      );

    if (result.rowCount === 0) {
      return [new Error('tag not found or already deleted'), null] as const;
    }
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}
