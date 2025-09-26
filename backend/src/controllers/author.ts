import { Request, Response } from "express";
import { getAuthorById, getAuthorsByUserId } from "../utils/author";
import {
  getAuthorByIdSchema,
  getAuthorByUserIdSchema,
} from "../utils/validations/author";

export async function authorByUserIdController(req: Request, res: Response) {
  const userId = req.params.userId;

  const validate = getAuthorByUserIdSchema.safeParse({ userId });

  if (!validate.success) {
    res.status(400).json({ message: "invalid userId" });
    return;
  }

  const [error, author] = await getAuthorsByUserId(validate.data.userId);

  if (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  if (!author || author.length === 0) {
    res.status(404).json({ message: "no author found for this user" });
    return;
  }
  // TODO: add DTO here to filter out some stuff
  res.status(200).json(author);
}

export async function authorByIdController(req: Request, res: Response) {
  const authorId = req.params.authorId;
  const userId = req.params.userId;

  const validate = getAuthorByIdSchema.safeParse({ authorId, userId });

  if (!validate.success) {
    res.status(400).json({ message: "invalid authorId or userId" });
    return;
  }

  const [error, author] = await getAuthorById(
    validate.data.authorId,
    validate.data.userId
  );

  if (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  if (!author) {
    res.status(404).json({ message: "no author found for this id" });
    return;
  }
  // TODO: add DTO here to filter out some stuff
  res.status(200).json(author);
}
