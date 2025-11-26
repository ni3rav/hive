import { Router } from 'express';
import { verifyPublicApiKey } from '../middleware/public-api-key';
import {
  getPublicPostController,
  getPublicStatsController,
  listPublicAuthorsController,
  listPublicCategoriesController,
  listPublicPostsController,
  listPublicTagsController,
} from '../controllers/public';

export const publicResourcesRouter = Router({ mergeParams: true });

publicResourcesRouter.get('/posts', listPublicPostsController);
publicResourcesRouter.get('/posts/:postSlug', getPublicPostController);
publicResourcesRouter.get('/tags', listPublicTagsController);
publicResourcesRouter.get('/categories', listPublicCategoriesController);
publicResourcesRouter.get('/authors', listPublicAuthorsController);
publicResourcesRouter.get('/stats', getPublicStatsController);

export const router = Router();

router.use('/:apiKey', verifyPublicApiKey, publicResourcesRouter);
