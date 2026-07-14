import { NextFunction, Request, Response } from 'express';
import {
  isSupportedVersion,
  getVersionConfig,
  isDeprecated,
  getDeprecationHeaders,
  isVersionSunset,
} from '../utils/version-manager';
import { gone, notFound } from '../utils/responses';

declare module 'express-serve-static-core' {
  interface Request {
    apiVersion?: string;
  }
}

export function apiVersionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const version = req.params.apiVersion;

  if (!isSupportedVersion(version)) {
    return notFound(res, `API version ${version} not found`);
  }

  // check if version is sunset (past end-of-life)
  if (isVersionSunset(version)) {
    const config = getVersionConfig(version);
    return gone(res, `API version ${version} is no longer supported`, {
      migrate_to: config?.migration,
      sunset_date: config?.sunsetAt,
    });
  }

  // add deprecation headers if version is deprecated but still available
  if (isDeprecated(version)) {
    const deprecationHeaders = getDeprecationHeaders(version);
    if (deprecationHeaders) {
      Object.entries(deprecationHeaders).forEach(([key, value]) => {
        res.set(key, value);
      });
    }
  }

  req.apiVersion = version;
  next();
}
