import { Request, Response, Router } from "express";
import { registerController } from "../controllers/auth";

export const router = Router();

router.get("/", (req: Request, res: Response) =>
  res.send("<p>auth routes</p>")
);
router.post("/register", registerController);
