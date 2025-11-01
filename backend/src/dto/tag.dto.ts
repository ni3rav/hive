import { tagTable } from '../db/schema';

export interface TagResponseDto {
  workspaceId: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export function toTagResponseDto(
  tag: typeof tagTable.$inferSelect,
): TagResponseDto {
  return {
    workspaceId: tag.workspaceId,
    name: tag.name,
    slug: tag.slug,
    createdAt: tag.createdAt,
  };
}

export function toTagListResponseDto(
  tags: (typeof tagTable.$inferSelect)[],
): TagResponseDto[] {
  return tags.map(toTagResponseDto);
}
