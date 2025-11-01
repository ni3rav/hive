import { Router } from 'express';
import {
  createWorkspaceController,
  getUserWorkspacesController,
  verifyWorkspaceAccessController,
  updateWorkspaceController,
  deleteWorkspaceController,
} from '../controllers/workspace';
import { verifyWorkspaceMembership } from '../middleware/workspace';

export const router = Router();

router.post('/', createWorkspaceController);
router.get('/', getUserWorkspacesController);
router.get(
  '/verify/:workspaceSlug',
  verifyWorkspaceMembership,
  verifyWorkspaceAccessController,
);
router.patch(
  '/:workspaceSlug',
  verifyWorkspaceMembership,
  updateWorkspaceController,
);
router.delete(
  '/:workspaceSlug',
  verifyWorkspaceMembership,
  deleteWorkspaceController,
);
