import { db } from '../db';
import { categoryTable, postsTable } from '../db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { getWorkspaceBySlug } from './workspace';

export async function getCategoriesByWorkspaceSlug(workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const result = await db.query.categoryTable.findMany({
      where: eq(categoryTable.workspaceId, workspace.id),
    });
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function createCategory(
  workspaceSlug: string,
  data: {
    name: string;
    slug: string;
  },
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    // check if slug already exists in this workspace
    const existingCategory = await db.query.categoryTable.findFirst({
      where: and(
        eq(categoryTable.slug, data.slug),
        eq(categoryTable.workspaceId, workspace.id),
      ),
    });

    if (existingCategory) {
      throw new Error('category slug already exists in this workspace');
    }

    const [category] = await db
      .insert(categoryTable)
      .values({
        workspaceId: workspace.id,
        name: data.name,
        slug: data.slug,
      })
      .returning();

    return [null, category] as const;
  } catch (error) {
    return [error, null] as const;
  }
}

export async function updateCategory(
  categorySlug: string,
  workspaceSlug: string,
  data: {
    name?: string;
    slug?: string;
  },
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    // check if category exists
    const existingCategory = await db.query.categoryTable.findFirst({
      where: and(
        eq(categoryTable.slug, categorySlug),
        eq(categoryTable.workspaceId, workspace.id),
      ),
    });

    if (!existingCategory) {
      throw new Error('category not found');
    }

    // check uniqueness of slug when updated
    if (data.slug && data.slug !== categorySlug) {
      const duplicateCategory = await db.query.categoryTable.findFirst({
        where: and(
          eq(categoryTable.slug, data.slug),
          eq(categoryTable.workspaceId, workspace.id),
        ),
      });

      if (duplicateCategory) {
        throw new Error('category slug already exists in this workspace');
      }

      // update category and all related posts in a transaction
      const result = await db.transaction(async (tx) => {
        const postsToUpdate = await tx.query.postsTable.findMany({
          where: and(
            eq(postsTable.categorySlug, categorySlug),
            eq(postsTable.workspaceId, workspace.id),
          ),
          columns: { id: true },
        });

        const postIds = postsToUpdate.map((p) => p.id);

        // step 2: temporarily set posts categorySlug to null
        // this breaks the foreign key reference to allow category update
        if (postIds.length > 0) {
          await tx
            .update(postsTable)
            .set({ categorySlug: null })
            .where(
              and(
                eq(postsTable.categorySlug, categorySlug),
                eq(postsTable.workspaceId, workspace.id),
              ),
            );
        }

        const [updatedCategory] = await tx
          .update(categoryTable)
          .set(data)
          .where(
            and(
              eq(categoryTable.slug, categorySlug),
              eq(categoryTable.workspaceId, workspace.id),
            ),
          )
          .returning();

        if (postIds.length > 0) {
          await tx
            .update(postsTable)
            .set({ categorySlug: data.slug })
            .where(inArray(postsTable.id, postIds));
        }

        return updatedCategory;
      });

      return [null, result] as const;
    } else {
      // name update, no slug change
      const [result] = await db
        .update(categoryTable)
        .set(data)
        .where(
          and(
            eq(categoryTable.slug, categorySlug),
            eq(categoryTable.workspaceId, workspace.id),
          ),
        )
        .returning();

      return [null, result] as const;
    }
  } catch (error) {
    return [error, null] as const;
  }
}

export async function deleteCategory(
  categorySlug: string,
  workspaceSlug: string,
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    const result = await db.transaction(async (tx) => {
      await tx
        .update(postsTable)
        .set({ categorySlug: null })
        .where(
          and(
            eq(postsTable.categorySlug, categorySlug),
            eq(postsTable.workspaceId, workspace.id),
          ),
        );

      // delete the category
      const deleteResult = await tx
        .delete(categoryTable)
        .where(
          and(
            eq(categoryTable.slug, categorySlug),
            eq(categoryTable.workspaceId, workspace.id),
          ),
        );

      return deleteResult;
    });

    if (result.rowCount === 0) {
      return [
        new Error('category not found or already deleted'),
        null,
      ] as const;
    }
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
}
