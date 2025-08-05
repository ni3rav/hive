import { Request, Response, Router } from "express";
import { loginController, registerController } from "../controllers/auth";

export const router = Router();

router.get("/", (req: Request, res: Response) =>
  res.send("<p>auth routes</p>")
);
router.post("/register", registerController);
router.post("/login", loginController);
