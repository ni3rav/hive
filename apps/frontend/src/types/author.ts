export interface Author {
  id: string;
  name: string;
  email: string;
  about?: string;
  socialLinks?: Record<string, string>;
}

export type CreateAuthorData = Omit<Author, 'id'>;
