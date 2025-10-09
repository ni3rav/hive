import { Router } from 'express';
import {
  loginController,
  registerController,
  meController,
  logoutController,
  verifyController,
  generateResetPasswordLinkController,
} from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

export const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', authMiddleware, meController);
router.post('/logout', authMiddleware, logoutController);
router.post('/verify', verifyController);
router.post('/password/forgot', generateResetPasswordLinkController);
