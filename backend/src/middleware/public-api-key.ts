import { NextFunction, Request, Response } from 'express';
import logger from '../logger';
import { unauthorized, serverError } from '../utils/responses';
import { parseWorkspaceApiKey } from '../utils/api-key';
import {
  findWorkspaceApiKeyByValue,
  updateWorkspaceApiKeyUsage,
} from '../utils/workspace-api-key';

declare module 'express-serve-static-core' {
  interface Request {
    publicWorkspaceId?: string;
    publicWorkspaceSlug?: string;
    workspaceApiKeyId?: string;
  }
}

export async function verifyPublicApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const apiKey = req.params.apiKey;

    if (!apiKey) {
      return unauthorized(res, 'API key required');
    }

    const parsedKey = parseWorkspaceApiKey(apiKey);

    if (!parsedKey) {
      return unauthorized(res, 'Invalid API key');
    }

    const [lookupError, record] = await findWorkspaceApiKeyByValue(apiKey);

    if (lookupError) {
      logger.error(lookupError, 'Error verifying public API key');
      return serverError(res, 'Failed to verify API key');
    }

    if (!record) {
      return unauthorized(res, 'Invalid API key');
    }

    req.publicWorkspaceId = record.workspace.id;
    req.publicWorkspaceSlug = record.workspace.slug;
    req.workspaceApiKeyId = record.id;

    logger.info(
      {
        apiKeyId: record.id,
        workspaceId: record.workspaceId,
        workspaceSlug: record.workspace.slug,
        resource: req.originalUrl,
        method: req.method,
        ip: req.ip,
      },
      'Public API key access granted',
    );

    void updateWorkspaceApiKeyUsage(record.id, req.ip);

    next();
  } catch (error) {
    logger.error(error, 'Unexpected error in verifyPublicApiKey');
    return serverError(res, 'Failed to verify API key');
  }
}
