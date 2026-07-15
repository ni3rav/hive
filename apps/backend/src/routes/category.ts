import { Router } from 'express';
import {
  listWorkspaceCategoriesController,
  createCategoryController,
  deleteCategoryController,
  updateCategoryController,
} from '../controllers/category';
import { verifyWorkspaceMembership } from '../middleware/workspace';

export const router = Router();

router.use('/:workspaceSlug', verifyWorkspaceMembership);

router.get('/:workspaceSlug', listWorkspaceCategoriesController);
router.post('/:workspaceSlug', createCategoryController);
router.delete('/:workspaceSlug/:categorySlug', deleteCategoryController);
router.patch('/:workspaceSlug/:categorySlug', updateCategoryController);
