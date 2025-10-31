import { MetadataForm } from '@/components/editor/metadata-form';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useState, useEffect } from 'react';
import { type PostMetadata } from '@/types/editor';
import { PlateEditor } from '@/components/editor/plate-editor';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { loadMetadata, saveMetadata } from '@/components/editor/persistence';

const getInitialMetadata = (): PostMetadata => ({
  title: '',
  slug: '',
  authors: [],
  publishedAt: new Date(),
  excerpt: '',
  category: [],
  tags: [],
});

export default function Editor() {
  const workspaceSlug = useWorkspaceSlug();
  const [isExpanded, setIsExpanded] = useState(false);
  const [metadata, setMetadata] = useState<PostMetadata>(getInitialMetadata);

  useEffect(() => {
    const savedMetadata = loadMetadata(workspaceSlug);
    if (savedMetadata) {
      setMetadata({
        ...getInitialMetadata(),
        ...savedMetadata,
        publishedAt: savedMetadata.publishedAt
          ? new Date(savedMetadata.publishedAt as string)
          : new Date(),
      });
    } else {
      // Reset to initial state for new workspace
      setMetadata(getInitialMetadata());
    }
  }, [workspaceSlug]);

  useEffect(() => {
    if (metadata.title || metadata.excerpt) {
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
      <div className='h-full p-6'>
        <MetadataForm
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          metadata={metadata}
          setMetadata={setMetadata}
          onTitleChange={onTitleChange}
        />
        <PlateEditor />
      </div>
    </ErrorBoundary>
  );
}
