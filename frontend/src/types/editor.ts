export interface PostMetadata {
  title: string;
  slug: string;
  authors: string[];
  publishedAt: Date;
  excerpt: string;
  category: string[] | null;
  tags: string[];
}
