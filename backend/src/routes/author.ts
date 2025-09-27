import { Router } from "express";
import {
  // authorByIdController,
  // authorByUserIdController,
  createAuthorController,
  deleteAuthorController,
  updateAuthorController,
} from "../controllers/author";

export const router = Router();

// router.get("/:userId", authorByUserIdController);
// router.get("/:userId/:authorId", authorByIdController);
router.post("/", createAuthorController);
router.delete("/:authorId", deleteAuthorController);
router.patch("/:authorId", updateAuthorController);
