import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { Tiptap } from '@/components/editor/Tiptap';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';
import { useEditorContext } from '@/components/editor/editor-context';

export default function Editor() {
  const { workspaceSlug, editorRef } = useEditorContext();

  useHead(
    createSEOMetadata({
      title: 'Create New Post',
      description: 'Create a new post in your workspace',
      noindex: true,
    }),
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className='h-full w-full flex flex-col'>
        <Tiptap ref={editorRef} workspaceSlug={workspaceSlug} />
      </div>
    </ErrorBoundary>
  );
}
