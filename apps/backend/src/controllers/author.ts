import { Request, Response } from 'express';
import {
  createAuthor,
  deleteAuthor,
  getAuthorsByWorkspaceSlug,
  updateAuthor,
} from '../utils/author';
import {
  createAuthorSchema,
  deleteAuthorSchema,
  updateAuthorSchema,
} from '../utils/validations/author';
import {
  toAuthorListResponseDto,
  toAuthorResponseDto,
} from '../dto/author.dto';
import {
  validationError,
  notFound,
  created,
  ok,
  serverError,
} from '../utils/responses';
import logger from '../logger';

export async function listWorkspaceAuthorsController(
  req: Request,
  res: Response,
) {
  const workspaceSlug = req.workspaceSlug!;

  const [error, authors] = await getAuthorsByWorkspaceSlug(workspaceSlug);

  if (error) {
    logger.error(error, 'Error fetching authors');
    return serverError(res, 'Failed to fetch authors');
  }

  return ok(
    res,
    'Authors retrieved successfully',
    toAuthorListResponseDto(authors || []),
  );
}

export async function createAuthorController(req: Request, res: Response) {
  const validatedBody = createAuthorSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  const { name, email, about, socialLinks } = validatedBody.data;
  const workspaceSlug = req.workspaceSlug!;

  const [error, author] = await createAuthor(workspaceSlug, {
    name,
    email,
    about,
    socialLinks,
  });

  if (error) {
    logger.error(error, 'Error creating author');
    return serverError(res, 'Failed to create author');
  }

  return created(res, 'Author created successfully', author);
}

export async function deleteAuthorController(req: Request, res: Response) {
  const authorId = req.params.authorId;

  const validate = deleteAuthorSchema.safeParse({ authorId });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const workspaceSlug = req.workspaceSlug!;

  const [error] = await deleteAuthor(validate.data.authorId, workspaceSlug);

  if (error) {
    if ((error as Error).message === 'author not found or already deleted') {
      return notFound(res, 'Author not found');
    } else if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    } else {
      logger.error(error, 'Error deleting author');
      return serverError(res, 'Failed to delete author');
    }
  }

  return ok(res, 'Author deleted successfully');
}

export async function updateAuthorController(req: Request, res: Response) {
  const authorId = req.params.authorId;
  const data = req.body;

  const validate = updateAuthorSchema.safeParse({
    authorId,
    data,
  });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const workspaceSlug = req.workspaceSlug!;

  const [error, authors] = await updateAuthor(
    validate.data.authorId,
    workspaceSlug,
    validate.data.data,
  );

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    } else {
      logger.error(error, 'Error updating author');
      return serverError(res, 'Failed to update author');
    }
  }

  const author = authors && authors.length > 0 ? authors[0] : null;

  return ok(
    res,
    'Author updated successfully',
    author ? toAuthorResponseDto(author) : undefined,
  );
}
