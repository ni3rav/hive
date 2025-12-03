import { useEffect, useRef, useState } from 'react';
import { Outlet, useParams, Navigate, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { PostMetadata } from '@/types/editor';
import { loadMetadata, saveMetadata } from '@/components/editor/persistence';
import type { TiptapHandle } from '@/components/editor/Tiptap';
import { EditorProvider } from '@/components/editor/editor-context';
import { EditorSidebar } from '@/components/EditorSidebar';
import { getCookie } from '@/lib/utils';

const EDITOR_SIDEBAR_COOKIE_NAME = 'editor_sidebar_state';

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

export function EditorLayout() {
  const { workspaceSlug, postSlug } = useParams<{
    workspaceSlug: string;
    postSlug?: string;
  }>();
  const navigate = useNavigate();

  const {
    data: workspace,
    isLoading,
    error,
  } = useWorkspaceVerification(workspaceSlug);

  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    if (typeof document === 'undefined') {
      return false;
    }

    const saved = getCookie(EDITOR_SIDEBAR_COOKIE_NAME);
    if (saved === 'false') return false;
    if (saved === 'true') return true;

    return false;
  });
  const [metadata, setMetadata] = useState<PostMetadata>(getInitialMetadata);
  const editorRef = useRef<TiptapHandle>(null);

  // Load saved draft metadata on mount
  useEffect(() => {
    if (!workspaceSlug || postSlug) return;

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
  }, [workspaceSlug, postSlug]);

  // Save metadata for draft persistence
  useEffect(() => {
    if (!workspaceSlug || postSlug) return;

    if (
      metadata.title ||
      metadata.excerpt ||
      metadata.categorySlug ||
      metadata.authorId ||
      metadata.tagSlugs?.length
    ) {
      saveMetadata(metadata, workspaceSlug);
    }
  }, [metadata, workspaceSlug, postSlug]);

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

  if (isLoading) {
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Spinner className='size-5' />
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return <Navigate to='/workspaces' replace />;
  }

  return (
    <EditorProvider
      value={{
        isExpanded,
        setIsExpanded,
        metadata,
        setMetadata,
        onTitleChange,
        editorRef: editorRef as React.RefObject<TiptapHandle>,
        workspaceSlug: workspaceSlug ?? '',
        postSlug,
        isEditing: !!postSlug,
      }}
    >
      <SidebarProvider
        storageKey={EDITOR_SIDEBAR_COOKIE_NAME}
        open={isExpanded}
        onOpenChange={setIsExpanded}
        style={
          {
            '--sidebar-width': '32rem',
          } as React.CSSProperties
        }
      >
        {/* Main content area that should fill the screen height like DashboardLayout */}
        <SidebarInset className='flex flex-col h-screen overflow-hidden'>
          <header className='flex h-12 shrink-0 items-center gap-2'>
            <div className='flex w-full items-center justify-between px-4'>
              {/* Back button (icon-only) */}
              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigate(-1)}
                className='mr-2'
              >
                <X className='size-4' />
                <span className='sr-only'>Back</span>
              </Button>
              {/* Keep the expand/collapse trigger aligned with the right sidebar */}
              <SidebarTrigger />
            </div>
          </header>
          <main className='flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0 overflow-hidden'>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </SidebarInset>

        {/* Right-side sidebar specifically for the editor */}
        <Sidebar side='right' variant='floating' collapsible='offcanvas'>
          <EditorSidebar />
          <SidebarRail />
        </Sidebar>
      </SidebarProvider>
    </EditorProvider>
  );
}
