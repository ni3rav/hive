export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
}