import TagsManager from '@/components/Tag/TagManager';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function TagsPage() {
  useHead(
    createSEOMetadata({
      title: 'Tags',
      description: 'Manage tags in your workspace',
      noindex: true,
    }),
  );

  return <TagsManager />;
}
