import { Request, Response } from 'express';
import {
  getPostsByWorkspaceSlug,
  getPostBySlugWithContent,
  createPost,
  updatePost,
  deletePost,
} from '../utils/post';
import {
  createPostSchema,
  updatePostSchema,
  getPostSchema,
  deletePostSchema,
} from '../utils/validations/post';
import {
  toPostMetadataListResponseDto,
  toPostWithContentResponseDto,
  toPostMetadataResponseDto,
} from '../dto/post.dto';
import {
  validationError,
  notFound,
  created,
  ok,
  serverError,
  conflict,
} from '../utils/responses';

//* list all posts in workspace (metadata only, no content)
export async function listWorkspacePostsController(
  req: Request,
  res: Response,
) {
  const workspaceSlug = req.workspaceSlug!;

  const [error, posts] = await getPostsByWorkspaceSlug(workspaceSlug);

  if (error) {
    console.error('error fetching posts:', error);
    return serverError(res, 'failed to fetch posts');
  }

  return ok(
    res,
    'posts retrieved successfully',
    toPostMetadataListResponseDto(posts || []),
  );
}

//* get single post with full content
export async function getPostWithContentController(
  req: Request,
  res: Response,
) {
  const postSlug = req.params.postSlug;
  const workspaceSlug = req.workspaceSlug!;

  const validate = getPostSchema.safeParse({ postSlug });

  if (!validate.success) {
    return validationError(res, 'invalid request data', validate.error.issues);
  }

  const [error, post] = await getPostBySlugWithContent(
    validate.data.postSlug,
    workspaceSlug,
  );

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'workspace not found');
    } else if ((error as Error).message === 'post not found') {
      return notFound(res, 'post not found');
    } else {
      console.error('error fetching post:', error);
      return serverError(res, 'failed to fetch post');
    }
  }

  return ok(
    res,
    'post retrieved successfully',
    toPostWithContentResponseDto(post!),
  );
}

//* create new post
export async function createPostController(req: Request, res: Response) {
  const validatedBody = createPostSchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'invalid request data',
      validatedBody.error.issues,
    );
  }

  const workspaceSlug = req.workspaceSlug!;
  const userId = req.userId!;

  const [error, post] = await createPost(
    workspaceSlug,
    userId,
    validatedBody.data,
  );

  if (error) {
    if (
      (error as Error).message === 'post slug already exists in this workspace'
    ) {
      return conflict(res, 'post slug already exists in this workspace');
    } else if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'workspace not found');
    } else {
      console.error('error creating post:', error);
      return serverError(res, 'failed to create post');
    }
  }

  return created(
    res,
    'post created successfully',
    toPostMetadataResponseDto(post!),
  );
}

//* update post
export async function updatePostController(req: Request, res: Response) {
  const postSlug = req.params.postSlug;
  const data = req.body;

  const validate = updatePostSchema.safeParse({
    postSlug,
    data,
  });

  if (!validate.success) {
    return validationError(res, 'invalid request data', validate.error.issues);
  }

  const workspaceSlug = req.workspaceSlug!;

  const [error, post] = await updatePost(
    validate.data.postSlug,
    workspaceSlug,
    validate.data.data,
  );

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'workspace not found');
    } else if ((error as Error).message === 'post not found') {
      return notFound(res, 'post not found');
    } else if (
      (error as Error).message === 'post slug already exists in this workspace'
    ) {
      return conflict(res, 'post slug already exists in this workspace');
    } else {
      console.error('error updating post:', error);
      return serverError(res, 'failed to update post');
    }
  }

  return ok(
    res,
    'post updated successfully',
    post ? toPostMetadataResponseDto(post) : undefined,
  );
}

//* delete post
export async function deletePostController(req: Request, res: Response) {
  const postSlug = req.params.postSlug;

  const validate = deletePostSchema.safeParse({ postSlug });

  if (!validate.success) {
    return validationError(res, 'invalid request data', validate.error.issues);
  }

  const workspaceSlug = req.workspaceSlug!;

  const [error] = await deletePost(validate.data.postSlug, workspaceSlug);

  if (error) {
    if ((error as Error).message === 'post not found or already deleted') {
      return notFound(res, 'post not found');
    } else if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'workspace not found');
    } else {
      console.error('error deleting post:', error);
      return serverError(res, 'failed to delete post');
    }
  }

  return ok(res, 'post deleted successfully');
}
