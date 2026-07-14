import ApiKeysManager from '@/components/ApiKeys/ApiKeysManager';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function ApiKeysPage() {
  useHead(
    createSEOMetadata({
      title: 'API Keys',
      description: 'Manage your API keys',
      noindex: true,
    }),
  );

  return <ApiKeysManager />;
}

