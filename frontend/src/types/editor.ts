export interface PostMetadata {
  title: string;
  slug: string;
  authorId?: string;
  publishedAt: Date;
  excerpt: string;
  categorySlug?: string;
  tagSlugs: string[];
  visible: boolean;
  status: 'draft' | 'published';
}
