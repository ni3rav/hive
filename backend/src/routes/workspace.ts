import { Router } from 'express';
import { createWorkspaceController } from '../controllers/workspace';
import { getUserWorkspaces } from '../utils/workspace';

export const router = Router();

router.post('/', createWorkspaceController);
router.get('/', getUserWorkspaces);
