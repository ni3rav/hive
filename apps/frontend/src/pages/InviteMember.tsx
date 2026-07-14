import InviteMember from '@/components/Member/InviteMemberPage';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function InviteMemberWrapper() {
  useHead(
    createSEOMetadata({
      title: 'Invite Member',
      description: 'Invite a new member to your workspace',
      noindex: true,
    }),
  );

  return <InviteMember />;
}
