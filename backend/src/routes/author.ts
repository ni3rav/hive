import { Router } from 'express';
import {
  // authorByIdController,
  listUserAuthorsController,
  createAuthorController,
  deleteAuthorController,
  updateAuthorController,
} from '../controllers/author';

export const router = Router();

router.get('/', listUserAuthorsController);
// router.get("/:userId/:authorId", authorByIdController);
router.post('/', createAuthorController);
router.delete('/:authorId', deleteAuthorController);
router.patch('/:authorId', updateAuthorController);
