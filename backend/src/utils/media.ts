import { db } from '../db';
import { mediaTable } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { getWorkspaceBySlug } from './workspace';
import logger from '../logger';

export async function getMediaByWorkspaceSlug(workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const result = await db.query.mediaTable.findMany({
      where: eq(mediaTable.workspaceId, workspace.id),
      orderBy: (media, { desc }) => [desc(media.createdAt)],
    });
    return [null, result];
  } catch (error) {
    logger.error(error, 'Error fetching media');
    return [error, null];
  }
}

export async function getMediaById(mediaId: string, workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);
    const media = await db.query.mediaTable.findFirst({
      where: and(
        eq(mediaTable.id, mediaId),
        eq(mediaTable.workspaceId, workspace.id),
      ),
    });

    if (!media) {
      throw new Error('media not found');
    }

    return [null, media];
  } catch (error) {
    logger.error(error, 'Error fetching media');
    return [error, null];
  }
}

export async function createMedia(
  workspaceSlug: string,
  userId: string,
  data: {
    filename: string;
    contentType: string;
    size: number;
    r2Key: string;
    publicUrl: string;
  },
) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    const [media] = await db
      .insert(mediaTable)
      .values({
        workspaceId: workspace.id,
        uploadedBy: userId,
        filename: data.filename,
        contentType: data.contentType,
        size: data.size,
        r2Key: data.r2Key,
        publicUrl: data.publicUrl,
      })
      .returning();

    return [null, media];
  } catch (error) {
    logger.error(error, 'Error creating media');
    return [error, null];
  }
}

export async function deleteMedia(mediaId: string, workspaceSlug: string) {
  try {
    const workspace = await getWorkspaceBySlug(workspaceSlug);

    const result = await db
      .delete(mediaTable)
      .where(
        and(
          eq(mediaTable.id, mediaId),
          eq(mediaTable.workspaceId, workspace.id),
        ),
      );

    if (result.rowCount === 0) {
      return [new Error('media not found or already deleted'), null];
    }

    return [null, result];
  } catch (error) {
    logger.error(error, 'Error deleting media');
    return [error, null];
  }
}
