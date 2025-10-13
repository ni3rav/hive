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

export async function listUserAuthorsController(req: Request, res: Response) {
  const userId = req.userId!;

  const [error, authors] = await getAuthorsByUserId(userId!);

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
  const validatedBody = createAuthorSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  const { name, email, about, socialLinks } = validatedBody.data;
  const userId = req.userId!;

  const [error, author] = await createAuthor(userId!, {
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

  const validate = deleteAuthorSchema.safeParse({ authorId });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const userId = req.userId!;

  const [error] = await deleteAuthor(validate.data.authorId, userId!);

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
  const data = req.body;

  const validate = updateAuthorSchema.safeParse({
    authorId,
    data,
  });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const userId = req.userId!;

  const [error, authors] = await updateAuthor(
    validate.data.authorId,
    userId!,
    validate.data.data,
  );

  if (error) {
    console.error('Error updating author:', error);
    return serverError(res, 'Failed to update author');
  }

  const author = authors && authors.length > 0 ? authors[0] : null;

  return ok(
    res,
    'Author updated successfully',
    author ? toAuthorResponseDto(author) : undefined,
  );
}
