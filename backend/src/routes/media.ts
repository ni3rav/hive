import { Router } from 'express';
import {
  generatePresignedUrlController,
  confirmUploadController,
  listMediaController,
  deleteMediaController,
} from '../controllers/media';
import { verifyWorkspaceMembership } from '../middleware/workspace';
import { requireMinRole } from '../middleware/workspace-role';

export const router = Router();

router.get(
  '/:workspaceSlug',
  verifyWorkspaceMembership,
  requireMinRole('member'),
  listMediaController,
);

router.post(
  '/:workspaceSlug/presigned-url',
  verifyWorkspaceMembership,
  requireMinRole('admin'),
  generatePresignedUrlController,
);

router.post(
  '/:workspaceSlug/confirm',
  verifyWorkspaceMembership,
  requireMinRole('admin'),
  confirmUploadController,
);

router.delete(
  '/:workspaceSlug/:mediaId',
  verifyWorkspaceMembership,
  requireMinRole('admin'),
  deleteMediaController,
);
