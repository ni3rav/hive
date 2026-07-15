import { Router, Request, Response, NextFunction } from 'express';
import { verifyPublicApiKey } from '../middleware/public-api-key';
import { apiVersionMiddleware } from '../middleware/api-version';
import { publicResourcesRouterV1 } from './public-v1';
import { notFound } from '../utils/responses';

export const router = Router();

// main versioned route: /api/public/:apiVersion/:apiKey/...
router.use(
  '/:apiVersion/:apiKey',
  apiVersionMiddleware,
  verifyPublicApiKey,
  (req: Request, res: Response, next: NextFunction) => {
    switch (req.params.apiVersion) {
      case 'v1':
        return publicResourcesRouterV1(req, res, next);
      default:
        return notFound(res, 'Version not found');
    }
  },
);

// legacy fallback: /api/public/:apiKey/... redirects to v1
router.use(
  '/:apiKey',
  (req: Request, res: Response, next: NextFunction) => {
    // inject v1 as default version
    req.params.apiVersion = 'v1';
    apiVersionMiddleware(req, res, () => {
      verifyPublicApiKey(req, res, () => {
        publicResourcesRouterV1(req, res, next);
      });
    });
  },
);
