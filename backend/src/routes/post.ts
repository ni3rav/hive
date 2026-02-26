import { Router } from 'express';
import express from 'express';
import {
  listWorkspacePostsController,
  getPostWithContentController,
  createPostController,
  updatePostController,
  deletePostController,
} from '../controllers/post';
import { verifyWorkspaceMembership } from '../middleware/workspace';

export const router = Router();

router.use('/:workspaceSlug', verifyWorkspaceMembership);

router.get('/:workspaceSlug', listWorkspacePostsController);
router.get('/:workspaceSlug/:postSlug', getPostWithContentController);
// Increase body size limit for large payloads on POST and PATCH
router.post(
  '/:workspaceSlug',
  express.json({ limit: '5mb' }),
  createPostController,
);
router.patch(
  '/:workspaceSlug/:postSlug',
  express.json({ limit: '5mb' }),
  updatePostController,
);
router.delete('/:workspaceSlug/:postSlug', deletePostController);
