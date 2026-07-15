import PostsManager from '@/components/Post/PostsManager';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function PostPage() {
  useHead(
    createSEOMetadata({
      title: 'Posts',
      description: 'Manage posts in your workspace',
      noindex: true,
    }),
  );

  return <PostsManager />;
}
