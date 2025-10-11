import { MetadataForm } from '@/components/editor/metadata-form';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useState } from 'react';
import { type PostMetadata } from '@/types/editor';

export default function Editor() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metadata, setMetadata] = useState<PostMetadata>({
    title: '',
    slug: '',
    authors: [],
    publishedAt: new Date(),
    excerpt: '',
    category: [],
    tags: [],
  });

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
      </div>
    </ErrorBoundary>
  );
}
