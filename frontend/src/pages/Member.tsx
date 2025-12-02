import MemberManager from '@/components/Member/MemberManager';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function MemberPage() {
  useHead(
    createSEOMetadata({
      title: 'Members',
      description: 'Manage members in your workspace',
      noindex: true,
    }),
  );

  return <MemberManager />;
}

