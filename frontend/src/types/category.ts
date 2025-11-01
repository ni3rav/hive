export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

export interface CreateCategoryData extends CategoryFormData {
  slug: string;
}