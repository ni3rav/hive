import { Router } from 'express';
import {
  getInvitationDetailsController,
  acceptInvitationController,
} from '../controllers/invitation';
import { authMiddleware } from '../middleware/auth';

export const router = Router();

router.get('/:token', getInvitationDetailsController);
router.post('/:token/accept', authMiddleware, acceptInvitationController);
