import { Request, Response } from 'express';
import {
  createTag,
  deleteTag,
  getTagsByWorkspaceSlug,
  updateTag,
} from '../utils/tag';
import {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from '../utils/validations/tag';
import { toTagListResponseDto, toTagResponseDto } from '../dto/tag.dto';
import {
  validationError,
  notFound,
  created,
  ok,
  serverError,
  conflict,
} from '../utils/responses';
import logger from '../logger';

export async function listWorkspaceTagsController(req: Request, res: Response) {
  const workspaceSlug = req.workspaceSlug!;

  const [error, tags] = await getTagsByWorkspaceSlug(workspaceSlug);

  if (error) {
    logger.error(error, 'Error fetching tags');
    return serverError(res, 'Failed to fetch tags');
  }

  return ok(
    res,
    'Tags retrieved successfully',
    toTagListResponseDto(tags || []),
  );
}

export async function createTagController(req: Request, res: Response) {
  const validatedBody = createTagSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  const { name, slug } = validatedBody.data;
  const workspaceSlug = req.workspaceSlug!;

  const [error, tag] = await createTag(workspaceSlug, {
    name,
    slug,
  });

  if (error) {
    if (
      (error as Error).message === 'tag slug already exists in this workspace'
    ) {
      return conflict(res, 'Tag slug already exists in this workspace');
    }
    logger.error(error, 'Error creating tag');
    return serverError(res, 'Failed to create tag');
  }

  return created(res, 'Tag created successfully', toTagResponseDto(tag!));
}

export async function deleteTagController(req: Request, res: Response) {
  const tagSlug = req.params.tagSlug;

  const validate = deleteTagSchema.safeParse({ tagSlug });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const workspaceSlug = req.workspaceSlug!;

  const [error] = await deleteTag(validate.data.tagSlug, workspaceSlug);

  if (error) {
    if ((error as Error).message === 'tag not found or already deleted') {
      return notFound(res, 'Tag not found');
    } else if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    } else {
      logger.error(error, 'Error deleting tag');
      return serverError(res, 'Failed to delete tag');
    }
  }

  return ok(res, 'Tag deleted successfully');
}

export async function updateTagController(req: Request, res: Response) {
  const tagSlug = req.params.tagSlug;
  const data = req.body;

  const validate = updateTagSchema.safeParse({
    tagSlug,
    data,
  });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const workspaceSlug = req.workspaceSlug!;

  const [error, tag] = await updateTag(
    validate.data.tagSlug,
    workspaceSlug,
    validate.data.data,
  );

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    } else if ((error as Error).message === 'tag not found') {
      return notFound(res, 'Tag not found');
    } else if (
      (error as Error).message === 'tag slug already exists in this workspace'
    ) {
      return conflict(res, 'Tag slug already exists in this workspace');
    } else {
      logger.error(error, 'Error updating tag');
      return serverError(res, 'Failed to update tag');
    }
  }

  return ok(
    res,
    'Tag updated successfully',
    tag ? toTagResponseDto(tag) : undefined,
  );
}
