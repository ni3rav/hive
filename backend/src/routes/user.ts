import { Router } from 'express';
import { editProfileController } from '../controllers/user';

export const router = Router();

router.patch('/edit', editProfileController);
