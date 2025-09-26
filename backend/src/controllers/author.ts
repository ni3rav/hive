import { Request, Response } from "express";
import { getAuthorsByUserId } from "../utils/author";

export async function authorByUserIdController(req: Request, res: Response) {
  const userId = req.params.userId;

  if (!userId) {
    res.status(400).json({ message: "userId is required" });
    return;
  }

  const [error, author] = await getAuthorsByUserId(userId);

  if (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  if (!author) {
    res.status(404).json({ message: "no author found for this user" });
    return;
  }

  res.status(200).json(author);
}
