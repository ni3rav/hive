import { Request, Response } from 'express';
import {
  createAuthor,
  deleteAuthor,
  getAuthorsByUserId,
  updateAuthor,
} from '../utils/author';
import {
  createAuthorSchema,
  deleteAuthorSchema,
  sessionIdSchema,
  updateAuthorSchema,
} from '../utils/validations/author';
import { getUserIdbySession } from '../utils/sessions';
import { toAuthorListResponseDto } from '../dto/author.dto';

export async function listUserAuthorsController(req: Request, res: Response) {
  const sessionId = req.cookies['session_id'];

  if (!sessionId) {
    res.status(401).json({ message: 'session id is required' });
    return;
  }

  const [sessionError, userId] = await getUserIdbySession(sessionId);

  if (sessionError) {
    res
      .status(500)
      .json({ message: 'internal server error while fetching user id' });
    return;
  }

  if (!userId) {
    res.status(404).json({ message: 'no user id found for this session' });
    return;
  }

  const [error, authors] = await getAuthorsByUserId(userId);

  if (error) {
    res.status(500).json({
      message: 'internal server error while fetching authors for user',
    });
    return;
  }

  if (!authors || authors.length === 0) {
    res.status(404).json({ message: 'no authors found for this user' });
    return;
  }

  res.status(200).json(toAuthorListResponseDto(authors));
  return;
}

export async function createAuthorController(req: Request, res: Response) {
  const sessionId = req.cookies['session_id'];

  const validatedBody = createAuthorSchema.safeParse(req.body);

  if (!validatedBody.success) {
    res.status(400).json({
      message: 'invalid data for creating author',
    });
    return;
  }

  const validatedSessionId = sessionIdSchema.safeParse({
    sessionId: sessionId,
  });

  if (!validatedSessionId.success) {
    res.status(401).json({
      message: 'invalid session id',
    });
    return;
  }

  const [sessionError, userId] = await getUserIdbySession(
    validatedSessionId.data.sessionId,
  );

  if (sessionError) {
    res.status(500).json({
      message: 'internal server error while fetching user id',
    });
    return;
  }

  if (!userId) {
    res.status(404).json({
      message: 'no user id found for this session',
    });
    return;
  }

  const { name, email, about, socialLinks } = validatedBody.data;

  const [error] = await createAuthor(userId, {
    name,
    email,
    about,
    socialLinks,
  });

  if (error) {
    res.status(500).json({
      message: 'internal server error while creating author',
    });
    return;
  }

  res.status(200).json({
    message: 'author created successfully',
  });
}

export async function deleteAuthorController(req: Request, res: Response) {
  const authorId = req.params.authorId;
  const sessionId = req.cookies['session_id'];

  const validate = deleteAuthorSchema.safeParse({ authorId, sessionId });

  if (!validate.success) {
    res.status(400).json({
      message: 'invalid data for deleting author',
    });
    return;
  }

  const [sessionError, userId] = await getUserIdbySession(
    validate.data.sessionId,
  );

  if (sessionError) {
    res.status(500).json({
      message: 'internal server error while fetching user id',
    });
    return;
  }

  if (!userId) {
    res.status(404).json({
      message: 'no user id found for this session',
    });
    return;
  }

  const [error] = await deleteAuthor(validate.data.authorId, userId);

  if (error) {
    if ((error as Error).message === 'author not found') {
      res.status(404).json({
        message: 'author not found or already deleted',
      });
    } else {
      res.status(500).json({
        message: 'internal server error while deleting author',
      });
    }
    return;
  }

  res.status(200).json({
    message: 'author deleted successfully',
  });
  return;
}

export async function updateAuthorController(req: Request, res: Response) {
  const authorId = req.params.authorId;
  const sessionId = req.cookies['session_id'];
  const data = req.body;

  const validate = updateAuthorSchema.safeParse({
    authorId,
    sessionId,
    data,
  });

  if (!validate.success) {
    if (
      validate.error.issues.some(
        (issue) =>
          issue.message === 'please provide at least one field to update',
      )
    ) {
      //* bad request response for empty request body
      res.status(400).json({
        message:
          'request body cannot be empty, please provide at least one field to update',
      });
      return;
    }
    //* default bad request response
    res.status(400).json({
      message: 'invalid data for updating author',
    });
    return;
  }

  const [sessionError, userId] = await getUserIdbySession(
    validate.data.sessionId,
  );

  if (sessionError) {
    res.status(500).json({
      message: 'internal server error while fetching user id',
    });
    return;
  }

  if (!userId) {
    res.status(404).json({
      message: 'no user id found for this session',
    });
    return;
  }

  const [error] = await updateAuthor(
    validate.data.authorId,
    userId,
    validate.data.data,
  );

  if (error) {
    res.status(500).json({
      message: 'internal server error while updating author',
    });
    return;
  }
  res.status(200).json({ message: 'author updated successfully' });
  return;
}
