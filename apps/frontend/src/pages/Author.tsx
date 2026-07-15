import AuthorsManager from '@/components/Author/AuthorsManager';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function AuthorsPage() {
  useHead(
    createSEOMetadata({
      title: 'Authors',
      description: 'Manage authors in your workspace',
      noindex: true,
    }),
  );

  return <AuthorsManager />;
}
