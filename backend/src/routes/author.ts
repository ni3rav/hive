import { Router } from "express";
import {
  authorByIdController,
  authorByUserIdController,
} from "../controllers/author";

export const router = Router();

router.get("/:userId", authorByUserIdController);
router.get("/:userId/:authorId", authorByIdController);
