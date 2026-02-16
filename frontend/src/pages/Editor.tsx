import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { Tiptap } from '@/components/editor/Tiptap';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';
import { useEditorContext } from '@/components/editor/editor-context';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Editor() {
  const { workspaceSlug, editorRef } = useEditorContext();
  const location = useLocation();
  const navigate = useNavigate();
  const markdownImport = (location.state as { markdownImport?: { raw: string } } | null)
    ?.markdownImport;

  useEffect(() => {
    if (markdownImport?.raw) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [markdownImport?.raw, location.pathname, navigate]);

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
        <Tiptap
          ref={editorRef}
          workspaceSlug={workspaceSlug}
          initialMarkdownImport={markdownImport?.raw}
        />
      </div>
    </ErrorBoundary>
  );
}
