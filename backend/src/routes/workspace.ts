import { Router } from 'express';
import { createWorkspaceController } from '../controllers/workspace';

export const router = Router();

router.post('/', createWorkspaceController);
