import { Router } from 'express';
import {
  createWorkspaceController,
  getUserWorkspacesController,
  verifyWorkspaceAccessController,
  updateWorkspaceController,
  deleteWorkspaceController,
  checkSlugAvailabilityController,
} from '../controllers/workspace';
import { verifyWorkspaceMembership } from '../middleware/workspace';
import {
  leaveWorkspaceController,
  inviteMemberController,
  listWorkspaceMembersController,
  removeMemberController,
  revokeInvitationController,
  updateMemberRoleController,
} from '../controllers/member';
import { requireMinRole } from '../middleware/workspace-role';

export const router = Router();

router.get('/check-slug/:slug', checkSlugAvailabilityController);
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

router.get(
  '/:workspaceSlug/members',
  verifyWorkspaceMembership,
  listWorkspaceMembersController,
);
router.post(
  '/:workspaceSlug/members/invite',
  verifyWorkspaceMembership,
  requireMinRole('admin'),
  inviteMemberController,
);
router.patch(
  '/:workspaceSlug/members/:userId',
  verifyWorkspaceMembership,
  requireMinRole('admin'),
  updateMemberRoleController,
);
router.delete(
  '/:workspaceSlug/members/:userId',
  verifyWorkspaceMembership,
  requireMinRole('admin'),
  removeMemberController,
);
router.delete(
  '/:workspaceSlug/members/invitations/:invitationId',
  verifyWorkspaceMembership,
  requireMinRole('admin'),
  revokeInvitationController,
);
router.delete(
  '/:workspaceSlug/members/leave',
  verifyWorkspaceMembership,
  leaveWorkspaceController,
);
