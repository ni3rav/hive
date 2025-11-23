import { MetadataForm } from '@/components/metadata-form';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { type PostMetadata } from '@/types/editor';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { usePost } from '@/hooks/usePost';
import { clearContent, clearMetadata } from '@/components/editor/persistence';
import { Tiptap, type TiptapHandle } from '@/components/editor/Tiptap';
import { Spinner } from '@/components/ui/spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { getErrorMessage } from '@/lib/error-utils';
import NotFound from '@/pages/NotFound';

export default function EditPost() {
  const workspaceSlug = useWorkspaceSlug();
  const navigate = useNavigate();
  const { postSlug } = useParams<{ postSlug: string }>();

  const [isExpanded, setIsExpanded] = useState(false);
  const [metadata, setMetadata] = useState<PostMetadata | null>(null);
  const [originalMetadata, setOriginalMetadata] = useState<PostMetadata | null>(
    null,
  );
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    (() => void) | null
  >(null);
  const editorRef = useRef<TiptapHandle>(null);

  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isPostError,
    error: postError,
  } = usePost(workspaceSlug || '', postSlug || '');

  useEffect(() => {
    if (workspaceSlug) {
      clearContent(workspaceSlug);
      clearMetadata(workspaceSlug);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    if (post) {
      const postMetadata: PostMetadata = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        authorId: post.author?.id,
        categorySlug: post.category?.slug,
        tagSlugs: post.tags.map((tag) => tag.slug),
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        visible: post.visible,
        status: post.status,
      };
      setMetadata(postMetadata);
      setOriginalMetadata(postMetadata);
      if (post.content?.contentJson) {
        setOriginalContent(JSON.stringify(post.content.contentJson));
      }
    }
  }, [post]);

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title: e.target.value,
      };
    });
  };

  const handleSetMetadata = (value: React.SetStateAction<PostMetadata>) => {
    setMetadata((prev) => {
      if (!prev) return prev;
      if (typeof value === 'function') {
        return value(prev);
      }
      return value;
    });
  };

  const hasUnsavedChanges = useCallback(() => {
    if (!originalMetadata || !metadata) return false;

    const editor = editorRef.current?.editor;
    if (!editor) return false;

    const currentContent = JSON.stringify(editor.getJSON());
    const contentChanged = currentContent !== originalContent;

    const metadataChanged =
      metadata.title !== originalMetadata.title ||
      metadata.slug !== originalMetadata.slug ||
      metadata.excerpt !== originalMetadata.excerpt ||
      metadata.authorId !== originalMetadata.authorId ||
      metadata.categorySlug !== originalMetadata.categorySlug ||
      JSON.stringify(metadata.tagSlugs) !==
        JSON.stringify(originalMetadata.tagSlugs) ||
      metadata.visible !== originalMetadata.visible ||
      metadata.status !== originalMetadata.status ||
      metadata.publishedAt?.getTime() !==
        originalMetadata.publishedAt?.getTime();

    return contentChanged || metadataChanged;
  }, [metadata, originalMetadata, originalContent]);

  const handleGoBack = () => {
    if (hasUnsavedChanges()) {
      setShowWarningDialog(true);
      setPendingNavigation(() => () => {
        navigate(`/dashboard/${workspaceSlug}/posts`);
        setShowWarningDialog(false);
        setPendingNavigation(null);
      });
    } else {
      navigate(`/dashboard/${workspaceSlug}/posts`);
    }
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges() && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowWarningDialog(true);
      setPendingNavigation(() => () => {
        blocker.proceed();
        setShowWarningDialog(false);
        setPendingNavigation(null);
      });
    }
  }, [blocker]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleCancelWarning = () => {
    setShowWarningDialog(false);
    setPendingNavigation(null);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      pendingNavigation();
    }
  };

  if (isLoadingPost) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Spinner className='h-8 w-8' />
          <p className='text-sm text-muted-foreground'>Loading post...</p>
        </div>
      </div>
    );
  }

  if (isPostError) {
    const apiError = postError as { response?: { status?: number } };
    const status = apiError?.response?.status;

    if (status === 404) {
      return <NotFound />;
    }

    return (
      <div className='flex h-full items-center justify-center p-6'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-destructive' />
              Error Loading Post
            </CardTitle>
            <CardDescription>
              {getErrorMessage(postError, 'Failed to load post')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoBack} className='w-full'>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Spinner className='h-8 w-8' />
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className='h-full flex flex-col overflow-y-scroll'>
        <MetadataForm
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          metadata={metadata}
          setMetadata={handleSetMetadata}
          onTitleChange={onTitleChange}
          editorRef={editorRef as React.RefObject<TiptapHandle>}
          workspaceSlug={workspaceSlug ?? ''}
          postSlug={postSlug}
          isEditing={true}
          originalPublishedAt={originalMetadata?.publishedAt}
          originalSlug={originalMetadata?.slug}
        />
        <div className='mt-6 flex-1 min-h-0'>
          <Tiptap
            ref={editorRef}
            workspaceSlug={workspaceSlug}
            initialContent={post?.content?.contentJson || null}
            disablePersistence={true}
          />
        </div>
      </div>

      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your
              changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={handleCancelWarning}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleConfirmNavigation}>
              Leave Without Saving
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
