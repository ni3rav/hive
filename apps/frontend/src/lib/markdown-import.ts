import yaml from 'js-yaml';
import { marked } from 'marked';
import { generateJSON } from '@tiptap/html';
import { getEditorExtensions } from '@/components/editor/extensions';
import type { ProseMirrorJSON } from '@/components/editor/persistence';
import type { PostMetadata } from '@/types/editor';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_SYNTAX_REGEX = /!\[[^\]]*\]\([^)]+\)/;
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(FRONTMATTER_REGEX);
  if (!match) return { data: {}, content: raw };

  const [, fm, content] = match;
  try {
    const data = (yaml.load(fm) as Record<string, unknown>) ?? {};
    return { data, content };
  } catch {
    return { data: {}, content };
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function toSlug(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const str = String(value).trim();
  if (!str) return undefined;
  return SLUG_REGEX.test(str) ? str : slugify(str);
}

function parseDate(value: unknown): Date | undefined {
  if (value == null) return undefined;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? undefined : d;
}

function toStatus(value: unknown): 'draft' | 'published' {
  if (value == null) return 'draft';
  const s = String(value).toLowerCase();
  if (s === 'published' || s === 'true' || s === '1') return 'published';
  if (s === 'draft' || s === 'false' || s === '0') return 'draft';
  return 'draft';
}

function toVisible(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

export interface ParseMarkdownResult {
  frontmatter: Partial<PostMetadata>;
  content: string;
  hasImages: boolean;
}

export function parseMarkdown(raw: string): ParseMarkdownResult {
  const { data, content } = parseFrontmatter(raw);
  const body = content.trim();

  const frontmatter: Partial<PostMetadata> = {};

  if (data.title != null) frontmatter.title = String(data.title).trim();
  if (data.slug != null) frontmatter.slug = toSlug(data.slug);
  if (data.visible != null) frontmatter.visible = toVisible(data.visible);
  if (data.status != null) frontmatter.status = toStatus(data.status);
  if (data.description != null) frontmatter.excerpt = String(data.description).trim();
  const publishedDate = parseDate(data.date ?? data.publishedAt ?? data.published);
  if (publishedDate) frontmatter.publishedAt = publishedDate;

  const hasImages = IMAGE_SYNTAX_REGEX.test(body);

  return {
    frontmatter,
    content: body,
    hasImages,
  };
}

export function markdownToProseMirrorJSON(markdownBody: string): ProseMirrorJSON {
  const html = marked.parse(markdownBody, { async: false }) as string;
  const extensions = getEditorExtensions();
  const json = generateJSON(html, extensions) as ProseMirrorJSON;
  return json;
}
