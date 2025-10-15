/*
import { Router } from 'express';
import {
  listUserAuthorsController,
  createAuthorController,
  deleteAuthorController,
  updateAuthorController,
} from '../controllers/author';

export const router = Router();

router.get('/', listUserAuthorsController);
router.post('/', createAuthorController);
router.delete('/:authorId', deleteAuthorController);
router.patch('/:authorId', updateAuthorController);
*/

import { Router } from 'express';

export const router = Router();

router.use((_req, res) => {
  return res.status(503).json({
    success: false,
    message: 'Author API temporarily disabled',
    code: 'SERVICE_UNAVAILABLE',
  });
});
