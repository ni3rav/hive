import { Request, Response } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategoriesByWorkspaceSlug,
  updateCategory,
} from '../utils/category';
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from '../utils/validations/category';
import {
  toCategoryListResponseDto,
  toCategoryResponseDto,
} from '../dto/category.dto';
import {
  validationError,
  notFound,
  created,
  ok,
  serverError,
  conflict,
} from '../utils/responses';

export async function listWorkspaceCategoriesController(
  req: Request,
  res: Response,
) {
  const workspaceSlug = req.workspaceSlug!;

  const [error, categories] = await getCategoriesByWorkspaceSlug(workspaceSlug);

  if (error) {
    console.error('Error fetching categories:', error);
    return serverError(res, 'Failed to fetch categories');
  }

  return ok(
    res,
    'Categories retrieved successfully',
    toCategoryListResponseDto(categories || []),
  );
}

export async function createCategoryController(req: Request, res: Response) {
  const validatedBody = createCategorySchema.safeParse(req.body);

  if (!validatedBody.success) {
    return validationError(
      res,
      'Invalid request data',
      validatedBody.error.issues,
    );
  }

  const { name, slug } = validatedBody.data;
  const workspaceSlug = req.workspaceSlug!;

  const [error, category] = await createCategory(workspaceSlug, {
    name,
    slug,
  });

  if (error) {
    if (
      (error as Error).message ===
      'category slug already exists in this workspace'
    ) {
      return conflict(res, 'Category slug already exists in this workspace');
    }
    console.error('Error creating category:', error);
    return serverError(res, 'Failed to create category');
  }

  return created(res, 'Category created successfully', category);
}

export async function deleteCategoryController(req: Request, res: Response) {
  const categorySlug = req.params.categorySlug;

  const validate = deleteCategorySchema.safeParse({ categorySlug });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const workspaceSlug = req.workspaceSlug!;

  const [error] = await deleteCategory(
    validate.data.categorySlug,
    workspaceSlug,
  );

  if (error) {
    if ((error as Error).message === 'category not found or already deleted') {
      return notFound(res, 'Category not found');
    } else if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    } else {
      console.error('Error deleting category:', error);
      return serverError(res, 'Failed to delete category');
    }
  }

  return ok(res, 'Category deleted successfully');
}

export async function updateCategoryController(req: Request, res: Response) {
  const categorySlug = req.params.categorySlug;
  const data = req.body;

  const validate = updateCategorySchema.safeParse({
    categorySlug,
    data,
  });

  if (!validate.success) {
    return validationError(res, 'Invalid request data', validate.error.issues);
  }

  const workspaceSlug = req.workspaceSlug!;

  const [error, category] = await updateCategory(
    validate.data.categorySlug,
    workspaceSlug,
    validate.data.data,
  );

  if (error) {
    if ((error as Error).message === 'workspace not found') {
      return notFound(res, 'Workspace not found');
    } else if (
      (error as Error).message ===
      'category slug already exists in this workspace'
    ) {
      return conflict(res, 'Category slug already exists in this workspace');
    } else {
      console.error('Error updating category:', error);
      return serverError(res, 'Failed to update category');
    }
  }

  return ok(
    res,
    'Category updated successfully',
    category ? toCategoryResponseDto(category) : undefined,
  );
}
