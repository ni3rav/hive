import CategoriesManager from '@/components/Category/CategoryManager';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function CategoriesPage() {
  useHead(
    createSEOMetadata({
      title: 'Categories',
      description: 'Manage categories in your workspace',
      noindex: true,
    }),
  );

  return <CategoriesManager />;
}
