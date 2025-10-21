import { Router } from 'express';
import {
  createWorkspaceController,
  getUserWorkspacesController,
  verifyWorkspaceAccessController,
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
