import { Router } from 'express';
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
router.post('/:workspaceSlug', createPostController);
router.patch('/:workspaceSlug/:postSlug', updatePostController);
router.delete('/:workspaceSlug/:postSlug', deletePostController);
