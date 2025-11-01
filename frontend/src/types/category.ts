export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
}