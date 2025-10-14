import { Router } from 'express';
import { createWorkspaceController, getUserWorkspacesController } from '../controllers/workspace';

export const router = Router();

router.post('/', createWorkspaceController);
router.get('/', getUserWorkspacesController);
