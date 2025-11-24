import type { ProseMirrorJSON } from '@/components/editor/persistence';

export interface Post {
  id: string;
  workspaceId: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published';
  visible: boolean;
  createdAt: string;
  publishedAt: string | null;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    slug: string;
    name: string;
  }>;
}

export interface CreatePostData {
  title: string;
  slug: string;
  excerpt: string;
  authorId?: string;
  categorySlug?: string;
  tagSlugs: string[];
  status: 'draft' | 'published';
  visible: boolean;
  contentHtml: string;
  contentJson: ProseMirrorJSON;
  publishedAt?: Date | null;
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  excerpt?: string;
  authorId?: string;
  categorySlug?: string;
  tagSlugs?: string[];
  status?: 'draft' | 'published';
  visible?: boolean;
  contentHtml?: string;
  contentJson?: ProseMirrorJSON;
  publishedAt?: Date | null;
}
