export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export type CreateCategoryData = Omit<Category, 'id'>;