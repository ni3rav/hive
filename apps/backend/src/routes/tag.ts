import { Router } from 'express';
import {
  listWorkspaceTagsController,
  createTagController,
  deleteTagController,
  updateTagController,
} from '../controllers/tag';
import { verifyWorkspaceMembership } from '../middleware/workspace';

export const router = Router();

router.use('/:workspaceSlug', verifyWorkspaceMembership);

router.get('/:workspaceSlug', listWorkspaceTagsController);
router.post('/:workspaceSlug', createTagController);
router.delete('/:workspaceSlug/:tagSlug', deleteTagController);
router.patch('/:workspaceSlug/:tagSlug', updateTagController);
