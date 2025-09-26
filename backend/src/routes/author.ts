import { Router } from "express";
import { authorByUserIdController } from "../controllers/author";

export const router = Router();

router.get("/:userId", authorByUserIdController);
