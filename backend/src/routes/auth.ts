import { Request, Response, Router } from "express";
import {
  loginController,
  registerController,
  meController,
  logoutController,
  verifyController,
} from "../controllers/auth";

export const router = Router();

router.get("/", (req: Request, res: Response) =>
  res.send("<p>auth routes</p>")
);
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", meController);
router.post("/logout", logoutController);
router.post("/verify", verifyController);
