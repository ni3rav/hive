import type { UseHeadInput } from 'unhead/types';
import { env } from './env';

export interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

const DEFAULT_SITE_NAME = 'Hive';
const DEFAULT_DESCRIPTION = 'Modern content management and publishing platform';
const DEFAULT_IMAGE = '/hive.png';

/**
 * Get the base URL for the application
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for SSR or build time
  return env.VITE_APP_URL;
}

/**
 * Creates SEO metadata using unhead
 */
export function createSEOMetadata(config: SEOConfig = {}): UseHeadInput {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image,
    url,
    type = 'website',
    siteName = DEFAULT_SITE_NAME,
    author,
    publishedTime,
    modifiedTime,
    tags = [],
    noindex = false,
    nofollow = false,
  } = config;

  const baseUrl = getBaseUrl();
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${baseUrl}${image}`
    : `${baseUrl}${DEFAULT_IMAGE}`;
  const pageUrl = url
    ? url.startsWith('http')
      ? url
      : `${baseUrl}${url}`
    : baseUrl;

  const meta: UseHeadInput = {
    title: fullTitle,
    meta: [
      // Basic meta tags
      { name: 'description', content: description },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#151718' },

      // Open Graph tags
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: pageUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: siteName },

      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },

      // Article-specific tags
      ...(type === 'article'
        ? [
            ...(author
              ? [{ property: 'article:author', content: author }]
              : []),
            ...(publishedTime
              ? [{ property: 'article:published_time', content: publishedTime }]
              : []),
            ...(modifiedTime
              ? [{ property: 'article:modified_time', content: modifiedTime }]
              : []),
            ...(tags.length > 0
              ? tags.map((tag) => ({ property: 'article:tag', content: tag }))
              : []),
          ]
        : []),

      // Robots meta
      ...(noindex || nofollow
        ? [
            {
              name: 'robots',
              content: `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`,
            },
          ]
        : []),
    ],
    link: [
      // Canonical URL
      { rel: 'canonical', href: pageUrl },
    ],
  };

  return meta;
}

/**
 * Helper to create SEO metadata for a post/article
 */
export function createPostSEOMetadata(
  post: {
    title: string;
    excerpt?: string;
    slug: string;
    publishedAt?: string | null;
    updatedAt?: string;
    author?: { name: string } | null;
    tags?: Array<{ name: string }>;
    image?: string;
  },
  workspaceSlug: string,
): UseHeadInput {
  const baseUrl = getBaseUrl();
  const postUrl = `${baseUrl}/dashboard/${workspaceSlug}/posts/${post.slug}`;
  const tags = post.tags?.map((tag) => tag.name) || [];

  return createSEOMetadata({
    title: post.title,
    description: post.excerpt || `${post.title} - Published on Hive`,
    url: postUrl,
    type: 'article',
    author: post.author?.name,
    publishedTime: post.publishedAt || undefined,
    modifiedTime: post.updatedAt,
    tags,
    image: post.image,
  });
}

/**
 * Helper to create SEO metadata for the landing page
 */
export function createLandingPageSEOMetadata(): UseHeadInput {
  return createSEOMetadata({
    title: 'A simple CMS for your next project',
    description:
      'Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up',
    url: '/',
    type: 'website',
    image: '/hive.png',
  });
}

/**
 * Helper to create SEO metadata for auth pages
 */
export function createAuthPageSEOMetadata(
  page: 'login' | 'register' | 'forgot-password' | 'reset-password',
): UseHeadInput {
  const titles = {
    login: 'Login',
    register: 'Sign Up',
    'forgot-password': 'Forgot Password',
    'reset-password': 'Reset Password',
  };

  const descriptions = {
    login: 'Login to your Hive account',
    register: 'Create a new Hive account',
    'forgot-password': 'Reset your Hive account password',
    'reset-password': 'Set a new password for your Hive account',
  };

  return createSEOMetadata({
    title: titles[page],
    description: descriptions[page],
    url: `/${page === 'forgot-password' ? 'forgot-password' : page === 'reset-password' ? 'reset' : page}`,
    noindex: true, // Auth pages typically shouldn't be indexed
  });
}

/**
 * Helper to create SEO metadata for dashboard pages
 */
export function createDashboardSEOMetadata(
  workspaceName?: string,
  page?: string,
): UseHeadInput {
  const pageTitle = page
    ? `${page.charAt(0).toUpperCase() + page.slice(1)} - ${workspaceName || 'Dashboard'}`
    : workspaceName || 'Dashboard';

  return createSEOMetadata({
    title: pageTitle,
    description: `Manage your content in ${workspaceName || 'your workspace'}`,
    noindex: true, // Dashboard pages are typically private
  });
}
