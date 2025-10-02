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
import {
  validationError,
  unauthorized,
  notFound,
  created,
  ok,
  serverError,
} from '../utils/responses';

export async function listUserAuthorsController(req: Request, res: Response) {
  const sessionId = req.cookies['session_id'];

  if (!sessionId) {
    return unauthorized(res, 'No active session');
  }

  const [sessionError, userId] = await getUserIdbySession(sessionId);

  if (sessionError) {
    return unauthorized(res, 'Invalid or expired session');
  }

  if (!userId) {
    return unauthorized(res, 'Invalid or expired session');
  }

  const [error, authors] = await getAuthorsByUserId(userId);

  if (error) {
    console.error('Error fetching authors:', error);
    return serverError(res, 'Failed to fetch authors');
  }

  return ok(
    res,
    'Authors retrieved successfully',
    toAuthorListResponseDto(authors || []),
  );
}

export async function createAuthorController(req: Request, res: Response) {
  const sessionId = req.cookies['session_id'];

  const validatedBody = createAuthorSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  const validatedSessionId = sessionIdSchema.safeParse({
    sessionId: sessionId,
  });

  if (!validatedSessionId.success) {
    return unauthorized(res, 'Invalid session');
  }

  const [sessionError, userId] = await getUserIdbySession(
    validatedSessionId.data.sessionId,
  );

  if (sessionError) {
    return unauthorized(res, 'Invalid or expired session');
  }

  if (!userId) {
    return unauthorized(res, 'Invalid or expired session');
  }

  const { name, email, about, socialLinks } = validatedBody.data;

  const [error, author] = await createAuthor(userId, {
    name,
    email,
    about,
    socialLinks,
  });

  if (error) {
    console.error('Error creating author:', error);
    return serverError(res, 'Failed to create author');
  }

  return created(res, 'Author created successfully', author);
}

export async function deleteAuthorController(req: Request, res: Response) {
  const authorId = req.params.authorId;
  const sessionId = req.cookies['session_id'];

  const validate = deleteAuthorSchema.safeParse({ authorId, sessionId });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const [sessionError, userId] = await getUserIdbySession(
    validate.data.sessionId,
  );

  if (sessionError) {
    return unauthorized(res, 'Invalid or expired session');
  }

  if (!userId) {
    return unauthorized(res, 'Invalid or expired session');
  }

  const [error] = await deleteAuthor(validate.data.authorId, userId);

  if (error) {
    if ((error as Error).message === 'author not found') {
      return notFound(res, 'Author not found');
    } else {
      console.error('Error deleting author:', error);
      return serverError(res, 'Failed to delete author');
    }
  }

  return ok(res, 'Author deleted successfully');
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
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const [sessionError, userId] = await getUserIdbySession(
    validate.data.sessionId,
  );

  if (sessionError) {
    return unauthorized(res, 'Invalid or expired session');
  }

  if (!userId) {
    return unauthorized(res, 'Invalid or expired session');
  }

  const [error, author] = await updateAuthor(
    validate.data.authorId,
    userId,
    validate.data.data,
  );

  if (error) {
    console.error('Error updating author:', error);
    return serverError(res, 'Failed to update author');
  }

  return ok(res, 'Author updated successfully', author);
}
