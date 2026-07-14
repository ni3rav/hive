import { authorTable } from '../db/schema';

export interface AuthorResponseDto {
  id: string;
  name: string;
  email: string;
  about?: string;
  socialLinks?: Record<string, string>;
}

export function toAuthorResponseDto(
  author: typeof authorTable.$inferSelect,
): AuthorResponseDto {
  return {
    id: author.id,
    name: author.name,
    email: author.email,
    about: author.about ?? undefined,
    socialLinks:
      author.socialLinks && Object.keys(author.socialLinks).length > 0
        ? (author.socialLinks as Record<string, string>)
        : undefined,
  };
}

export function toAuthorListResponseDto(
  authors: (typeof authorTable.$inferSelect)[],
): AuthorResponseDto[] {
  return authors.map(toAuthorResponseDto);
}
