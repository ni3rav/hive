import { MetadataForm } from '@/components/metadata-form';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useState, useEffect, useRef } from 'react';
import { type PostMetadata } from '@/types/editor';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { loadMetadata, saveMetadata } from '@/components/editor/persistence';
import { Tiptap, type TiptapHandle } from '@/components/editor/Tiptap';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

const getInitialMetadata = (): PostMetadata => ({
  title: '',
  slug: '',
  authorId: undefined,
  publishedAt: new Date(),
  excerpt: '',
  categorySlug: undefined,
  tagSlugs: [],
  visible: true,
  status: 'draft',
});

export default function Editor() {
  const workspaceSlug = useWorkspaceSlug();

  const [isExpanded, setIsExpanded] = useState(false);
  const [metadata, setMetadata] = useState<PostMetadata>(getInitialMetadata);
  const editorRef = useRef<TiptapHandle>(null);

  useHead(
    createSEOMetadata({
      title: 'Create New Post',
      description: 'Create a new post in your workspace',
      noindex: true,
    }),
  );

  // Load saved draft metadata on mount
  useEffect(() => {
    if (!workspaceSlug) return;

    const savedMetadata = loadMetadata(workspaceSlug);
    if (savedMetadata) {
      setMetadata({
        ...getInitialMetadata(),
        ...savedMetadata,
        publishedAt: savedMetadata.publishedAt
          ? new Date(savedMetadata.publishedAt as string)
          : new Date(),
      });
    }
  }, [workspaceSlug]);

  // Save metadata for draft persistence
  useEffect(() => {
    if (!workspaceSlug) return;

    if (
      metadata.title ||
      metadata.excerpt ||
      metadata.categorySlug ||
      metadata.authorId ||
      metadata.tagSlugs?.length
    ) {
      saveMetadata(metadata, workspaceSlug);
    }
  }, [metadata, workspaceSlug]);

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setMetadata((prev) => ({
      ...prev,
      title,
      slug,
    }));
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className='h-full flex flex-col p-6'>
        <MetadataForm
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          metadata={metadata}
          setMetadata={setMetadata}
          onTitleChange={onTitleChange}
          editorRef={editorRef as React.RefObject<TiptapHandle>}
          workspaceSlug={workspaceSlug ?? ''}
          isEditing={false}
        />
        <div className='mt-6 flex-1 min-h-0'>
          <Tiptap ref={editorRef} workspaceSlug={workspaceSlug} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
