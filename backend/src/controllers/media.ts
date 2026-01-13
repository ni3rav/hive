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
  updateMediaThumbhash,
} from '../utils/media';
import {
  generatePresignedUrlSchema,
  confirmUploadSchema,
  deleteMediaSchema,
  updateThumbhashSchema,
} from '../utils/validations/media';
import {
  validationError,
  notFound,
  created,
  ok,
  serverError,
  forbidden,
} from '../utils/responses';
import { env } from '../env';
import logger from '../logger';
import https from 'https';
import { URL } from 'url';

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

    if (error || !media) {
      const [deleteError] = await deleteR2Object(key);
      if (deleteError) {
        logger.error(
          deleteError,
          'Failed to cleanup R2 object after DB insert failure',
        );
      }
      logger.error(
        error || new Error('Failed to create media'),
        'Failed to save media metadata',
      );
      return serverError(res, 'failed to save media metadata');
    }

    if (env.AZURE_THUMBHASH_FUNCTION_URL && env.AZURE_FUNCTION_SECRET) {
      triggerThumbhashGeneration({
        mediaId: media.id,
        publicUrl,
        size,
      });
    }

    return created(res, 'media uploaded successfully', media);
  } catch (error) {
    logger.error(error, 'Failed to confirm upload');
    return serverError(res, 'failed to confirm upload');
  }
}

function triggerThumbhashGeneration(payload: {
  mediaId: string;
  publicUrl: string;
  size: number;
}) {
  try {
    const url = new URL(env.AZURE_THUMBHASH_FUNCTION_URL);
    const data = JSON.stringify(payload);

    const options: https.RequestOptions = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'x-azure-function-secret': env.AZURE_FUNCTION_SECRET,
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {
        // intentionally ignore body
      });
      res.on('end', () => {
        // no-op
      });
    });

    req.on('error', (err) => {
      logger.error(err, 'Failed to trigger Azure thumbhash function');
    });

    req.write(data);
    req.end();
  } catch (error) {
    logger.error(
      error,
      'Failed to prepare request to Azure thumbhash function',
    );
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

export async function updateMediaThumbhashController(
  req: Request,
  res: Response,
) {
  const secret = req.header('x-azure-function-secret');

  if (!secret || secret !== env.AZURE_FUNCTION_SECRET) {
    return forbidden(res, 'invalid azure function secret');
  }

  const mediaId = req.params.mediaId;

  const validation = updateThumbhashSchema.safeParse(req.body);

  if (!validation.success) {
    return validationError(
      res,
      'invalid request data',
      validation.error.issues,
    );
  }

  const { thumbhash_base64, aspect_ratio } = validation.data;

  try {
    const [error] = await updateMediaThumbhash(mediaId, {
      thumbhashBase64: thumbhash_base64,
      aspectRatio: aspect_ratio,
    });

    if (error) {
      if ((error as Error).message === 'media not found') {
        return notFound(res, 'media not found');
      }

      logger.error(error, 'error updating media thumbhash');
      return serverError(res, 'failed to update media thumbhash');
    }

    return ok(res, 'media thumbhash updated successfully');
  } catch (error) {
    logger.error(error, 'failed to update media thumbhash');
    return serverError(res, 'failed to update media thumbhash');
  }
}
