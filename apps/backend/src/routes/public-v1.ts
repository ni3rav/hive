import { Router } from 'express';
import {
  getPublicPostController,
  getPublicStatsController,
  listPublicAuthorsController,
  listPublicCategoriesController,
  listPublicPostsController,
  listPublicTagsController,
} from '../controllers/public';

export const publicResourcesRouterV1 = Router({ mergeParams: true });

publicResourcesRouterV1.get('/posts', listPublicPostsController);
publicResourcesRouterV1.get('/posts/:postSlug', getPublicPostController);
publicResourcesRouterV1.get('/tags', listPublicTagsController);
publicResourcesRouterV1.get('/categories', listPublicCategoriesController);
publicResourcesRouterV1.get('/authors', listPublicAuthorsController);
publicResourcesRouterV1.get('/stats', getPublicStatsController);
