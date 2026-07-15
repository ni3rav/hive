import { Router } from 'express';
import {
  listWorkspaceAuthorsController,
  createAuthorController,
  deleteAuthorController,
  updateAuthorController,
} from '../controllers/author';
import { verifyWorkspaceMembership } from '../middleware/workspace';

export const router = Router();

router.use('/:workspaceSlug', verifyWorkspaceMembership);

router.get('/:workspaceSlug', listWorkspaceAuthorsController);
router.post('/:workspaceSlug', createAuthorController);
router.delete('/:workspaceSlug/:authorId', deleteAuthorController);
router.patch('/:workspaceSlug/:authorId', updateAuthorController);
