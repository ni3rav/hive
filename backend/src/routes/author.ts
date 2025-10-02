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
