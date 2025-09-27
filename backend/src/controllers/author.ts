import { Request, Response } from "express";
import {
  createAuthor,
  getAuthorById,
  getAuthorsByUserId,
} from "../utils/author";
import {
  createAuthorSchema,
  getAuthorByIdSchema,
  getAuthorByUserIdSchema,
  sessionIdSchema,
} from "../utils/validations/author";
import { getUserIdbySession } from "../utils/sessions";

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

export async function createAuthorController(req: Request, res: Response) {
  const sessionId = req.cookies["session_id"];

  const validatedBody = createAuthorSchema.safeParse(req.body);

  if (!validatedBody.success) {
    res.status(400).json({
      message: "invalid data for creating author",
    });
    return;
  }

  const validatedSessionId = sessionIdSchema.safeParse({
    sessionId: sessionId,
  });

  if (!validatedSessionId.success) {
    res.status(400).json({
      message: "invalid session id",
    });
    return;
  }

  const [sessionError, userId] = await getUserIdbySession(
    validatedSessionId.data.sessionId
  );

  if (sessionError) {
    res.status(500).json({
      message: "internal server error while fetching user id",
    });
    return;
  }

  if (!userId) {
    res.status(404).json({
      message: "no user id found for this session",
    });
    return;
  }

  const { name, email, about, socialLinks } = validatedBody.data;

  const [error, author] = await createAuthor(userId, {
    name,
    email,
    about,
    socialLinks,
  });

  if (error) {
    res.status(500).json({
      message: "internal server error while creating author",
    });
    return;
  }

  res.status(200).json({
    message: "author created successfully",
    author,
  });
}
