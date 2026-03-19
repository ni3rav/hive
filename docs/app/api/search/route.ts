import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

const searchApi = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});

const SUGGESTED_DOCS = [
  '',
  'getting-started',
  'posts',
  'tags',
  'categories',
  'authors',
  'stats',
  'response-shapes',
  'versioning',
  'api-reference',
] as const;

function buildDefaultSuggestions() {
  const pages = source.getPages();
  const pageMap = new Map(
    pages.map((page) => [page.slugs.join('/'), page] as const),
  );

  return SUGGESTED_DOCS.map((slug, index) => {
    const page = pageMap.get(slug);
    if (!page) return null;

    return {
      id: `default-${index}-${slug || 'overview'}`,
      url: slug ? `/docs/${slug}` : '/docs',
      type: 'page' as const,
      content: page.data.title,
      breadcrumbs: ['Docs'],
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('query')?.trim();

  if (!query) {
    return Response.json(buildDefaultSuggestions());
  }

  return searchApi.GET(request);
}
