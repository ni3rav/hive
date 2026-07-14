import { Request, Response } from 'express';
import logger from '../logger';
import {
  getPublicAuthors,
  getPublicCategories,
  getPublicPostBySlug,
  getPublicPosts,
  getPublicStats,
  getPublicTags,
} from '../utils/public-content';
import {
  toPublicAuthorListDto,
  toPublicCategoryListDto,
  toPublicPostDetailDto,
  toPublicPostsResponseDto,
  toPublicTagListDto,
  toPublicStatsDto,
} from '../dto/public.dto';

function parseNumber(value: unknown, defaultValue: number, max?: number) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return defaultValue;
  }
  if (max !== undefined) {
    return Math.min(parsed, max);
  }
  return parsed;
}

function parseTags(value: unknown): string[] | undefined {
  if (!value) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value
      .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
      .filter(Boolean);
  }
  return undefined;
}

export async function listPublicPostsController(req: Request, res: Response) {
  const workspaceId = req.publicWorkspaceId;

  if (!workspaceId) {
    return res.status(500).json({ message: 'Workspace context missing' });
  }

  const offset = parseNumber(req.query.offset, 0);
  const limit = parseNumber(req.query.limit, 20, 50);
  const categorySlug =
    typeof req.query.category === 'string' ? req.query.category : undefined;
  const authorId =
    typeof req.query.author === 'string' ? req.query.author : undefined;
  const tagSlugs = parseTags(req.query.tags);

  const [error, result] = await getPublicPosts({
    workspaceId,
    offset,
    limit,
    categorySlug,
    tagSlugs,
    authorId,
  });

  if (error || !result) {
    logger.error(error, 'Failed to fetch public posts');
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }

  return res.json(
    toPublicPostsResponseDto(
      result.posts,
      result.total,
      result.offset,
      Math.min(result.limit, limit),
    ),
  );
}

export async function getPublicPostController(req: Request, res: Response) {
  const workspaceId = req.publicWorkspaceId;
  const postSlug = req.params.postSlug;

  if (!workspaceId) {
    return res.status(500).json({ message: 'Workspace context missing' });
  }

  const [error, post] = await getPublicPostBySlug({
    workspaceId,
    postSlug,
  });

  if (error) {
    logger.error(error, 'Failed to fetch public post');
    return res.status(500).json({ message: 'Failed to fetch post' });
  }

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  return res.json(toPublicPostDetailDto(post));
}

export async function listPublicTagsController(req: Request, res: Response) {
  const workspaceId = req.publicWorkspaceId;

  if (!workspaceId) {
    return res.status(500).json({ message: 'Workspace context missing' });
  }

  const [error, tags] = await getPublicTags(workspaceId);

  if (error || !tags) {
    logger.error(error, 'Failed to fetch public tags');
    return res.status(500).json({ message: 'Failed to fetch tags' });
  }

  return res.json({ data: toPublicTagListDto(tags) });
}

export async function listPublicCategoriesController(
  req: Request,
  res: Response,
) {
  const workspaceId = req.publicWorkspaceId;

  if (!workspaceId) {
    return res.status(500).json({ message: 'Workspace context missing' });
  }

  const [error, categories] = await getPublicCategories(workspaceId);

  if (error || !categories) {
    logger.error(error, 'Failed to fetch public categories');
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }

  return res.json({ data: toPublicCategoryListDto(categories) });
}

export async function listPublicAuthorsController(
  req: Request,
  res: Response,
) {
  const workspaceId = req.publicWorkspaceId;

  if (!workspaceId) {
    return res.status(500).json({ message: 'Workspace context missing' });
  }

  const [error, authors] = await getPublicAuthors(workspaceId);

  if (error || !authors) {
    logger.error(error, 'Failed to fetch public authors');
    return res.status(500).json({ message: 'Failed to fetch authors' });
  }

  return res.json({ data: toPublicAuthorListDto(authors) });
}

export async function getPublicStatsController(req: Request, res: Response) {
  const workspaceId = req.publicWorkspaceId;

  if (!workspaceId) {
    return res.status(500).json({ message: 'Workspace context missing' });
  }

  const [error, stats] = await getPublicStats(workspaceId);

  if (error || !stats) {
    logger.error(error, 'Failed to fetch public stats');
    return res.status(500).json({ message: 'Failed to fetch stats' });
  }

  return res.json(toPublicStatsDto(stats));
}



