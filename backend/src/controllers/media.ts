import { Request, Response } from 'express';
import {
  generatePresignedUploadUrl,
  getR2PublicUrl,
  verifyR2ObjectExists,
  deleteR2Object,
} from '../utils/r2';
import { sanitizeFilename } from '../utils/filename';
import {
  getMediaByWorkspaceSlug,
  getMediaById,
  createMedia,
  deleteMedia,
} from '../utils/media';
import {
  generatePresignedUrlSchema,
  confirmUploadSchema,
  deleteMediaSchema,
} from '../utils/validations/media';
import {
  validationError,
  notFound,
  created,
  ok,
  serverError,
  forbidden,
} from '../utils/responses';
import logger from '../logger';

export async function generatePresignedUrlController(
  req: Request,
  res: Response,
) {
  const workspaceId = req.workspaceId!;

  const validation = generatePresignedUrlSchema.safeParse(req.body);
  if (!validation.success) {
    return validationError(
      res,
      'invalid request data',
      validation.error.issues,
    );
  }

  const { filename, contentType } = validation.data;

  try {
    const sanitizedFilename = sanitizeFilename(filename);

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const key = `workspace/${workspaceId}/${timestamp}-${random}-${sanitizedFilename}`;

    const [error, presignedUrl] = await generatePresignedUploadUrl({
      key,
      contentType,
      expiresIn: 300,
    });

    if (error) {
      logger.error(error, 'Failed to generate pre-signed URL');
      return serverError(res, 'failed to generate upload URL');
    }

    return ok(res, 'pre-signed URL generated successfully', {
      presignedUrl,
      key,
      expiresIn: 300,
    });
  } catch (error) {
    logger.error(error, 'Failed to generate pre-signed URL');
    return serverError(res, 'failed to generate upload URL');
  }
}

export async function confirmUploadController(req: Request, res: Response) {
  const workspaceId = req.workspaceId!;
  const workspaceSlug = req.workspaceSlug!;
  const userId = req.userId!;

  const validation = confirmUploadSchema.safeParse(req.body);
  if (!validation.success) {
    return validationError(
      res,
      'invalid request data',
      validation.error.issues,
    );
  }

  const { key, filename, contentType, size } = validation.data;

  try {
    if (!key.startsWith(`workspace/${workspaceId}/`)) {
      return validationError(res, 'invalid key for this workspace', [
        {
          path: ['key'],
          message: 'Key does not belong to this workspace',
          code: 'custom',
        },
      ]);
    }

    const [verifyError, exists] = await verifyR2ObjectExists(key);
    if (verifyError || !exists) {
      logger.error(
        verifyError || new Error('File not found in R2'),
        'R2 verification failed',
      );
      return serverError(res, 'file not found in R2');
    }

    const publicUrl = getR2PublicUrl(key);
    const sanitizedFilename = sanitizeFilename(filename);

    const [error, media] = await createMedia(workspaceSlug, userId, {
      filename: sanitizedFilename,
      contentType,
      size,
      r2Key: key,
      publicUrl,
    });

    if (error) {
      const [deleteError] = await deleteR2Object(key);
      if (deleteError) {
        logger.error(
          deleteError,
          'Failed to cleanup R2 object after DB insert failure',
        );
      }
      logger.error(error, 'Failed to save media metadata');
      return serverError(res, 'failed to save media metadata');
    }

    return created(res, 'media uploaded successfully', media);
  } catch (error) {
    logger.error(error, 'Failed to confirm upload');
    return serverError(res, 'failed to confirm upload');
  }
}

export async function listMediaController(req: Request, res: Response) {
  const workspaceSlug = req.workspaceSlug!;

  const [error, media] = await getMediaByWorkspaceSlug(workspaceSlug);

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'workspace not found');
    }
    logger.error(error, 'error fetching media');
    return serverError(res, 'failed to fetch media');
  }

  return ok(res, 'media retrieved successfully', media || []);
}

export async function deleteMediaController(req: Request, res: Response) {
  const workspaceSlug = req.workspaceSlug!;
  const userId = req.userId!;
  const workspaceRole = req.workspaceRole!;
  const mediaId = req.params.mediaId;

  const validate = deleteMediaSchema.safeParse({ mediaId });
  if (!validate.success) {
    return validationError(res, 'invalid request data', validate.error.issues);
  }

  const [fetchError, media] = await getMediaById(
    validate.data.mediaId,
    workspaceSlug,
  );

  if (fetchError) {
    if ((fetchError as Error).message === 'media not found') {
      return notFound(res, 'media not found');
    }
    if ((fetchError as Error).message === 'workspace not found') {
      return notFound(res, 'workspace not found');
    }
    logger.error(fetchError, 'error fetching media');
    return serverError(res, 'failed to fetch media');
  }

  if (!media) {
    return notFound(res, 'media not found');
  }

  if (workspaceRole === 'member' && media.uploadedBy !== userId) {
    return forbidden(res, 'You can only delete files uploaded by you');
  }

  const [r2Error] = await deleteR2Object(media.r2Key);
  if (r2Error) {
    logger.error(
      r2Error,
      'Failed to delete from R2, continuing with DB delete',
    );
  }

  const [error] = await deleteMedia(validate.data.mediaId, workspaceSlug);

  if (error) {
    if ((error as Error).message === 'media not found or already deleted') {
      return notFound(res, 'media not found');
    }
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'workspace not found');
    }
    logger.error(error, 'error deleting media');
    return serverError(res, 'failed to delete media');
  }

  return ok(res, 'media deleted successfully');
}
