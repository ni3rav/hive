import { categoryTable } from '../db/schema';

export interface CategoryResponseDto {
  workspaceId: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export function toCategoryResponseDto(
  category: typeof categoryTable.$inferSelect,
): CategoryResponseDto {
  return {
    workspaceId: category.workspaceId,
    name: category.name,
    slug: category.slug,
    createdAt: category.createdAt,
  };
}

export function toCategoryListResponseDto(
  categories: (typeof categoryTable.$inferSelect)[],
): CategoryResponseDto[] {
  return categories.map(toCategoryResponseDto);
}
