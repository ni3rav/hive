import { MetadataForm } from '@/components/metadata-form';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type PostMetadata } from '@/types/editor';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { usePost } from '@/hooks/usePost';
import {
  loadMetadata,
  saveMetadata,
  loadContent,
  clearWorkspacePersistence,
} from '@/components/editor/persistence';
import { Tiptap, type TiptapHandle } from '@/components/editor/Tiptap';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { getErrorMessage } from '@/lib/error-utils';

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
  const navigate = useNavigate();
  const { postSlug } = useParams<{ postSlug?: string }>();

  const [isExpanded, setIsExpanded] = useState(false);
  const [metadata, setMetadata] = useState<PostMetadata>(getInitialMetadata);
  const [isEditing, setIsEditing] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const editorRef = useRef<TiptapHandle>(null);
  const previousPostSlugRef = useRef<string | undefined>(undefined);
  const isInitialMountRef = useRef(true);

  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isPostError,
    error: postError,
  } = usePost(workspaceSlug || '', postSlug || '');

  useEffect(() => {
    if (!workspaceSlug) return;

    const postSlugChanged = !isInitialMountRef.current && previousPostSlugRef.current !== postSlug;
    
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }
    
    if (!postSlugChanged && previousPostSlugRef.current !== undefined) {
      return;
    }

    const hasDraft = () => {
      const savedMetadata = loadMetadata(workspaceSlug);
      const savedContent = loadContent(workspaceSlug);
      if (savedMetadata) {
        const title = savedMetadata.title;
        const excerpt = savedMetadata.excerpt;
        const hasTitle = typeof title === 'string' && title.trim() !== '';
        const hasExcerpt = typeof excerpt === 'string' && excerpt.trim() !== '';
        if (hasTitle || hasExcerpt) return true;
      }
      if (savedContent) {
        const contentStr = JSON.stringify(savedContent);
        if (
          contentStr &&
          !contentStr.includes('"type":"doc","content":[{"type":"paragraph"}]')
        ) {
          return true;
        }
      }
      return false;
    };

    const proceedWithLoad = () => {
      if (postSlug) {
        setIsEditing(true);
      } else {
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
      }
      previousPostSlugRef.current = postSlug;
    };

    if (hasDraft() && postSlugChanged) {
      setShowWarningDialog(true);
      setPendingAction(() => () => {
        clearWorkspacePersistence(workspaceSlug);
        proceedWithLoad();
        setShowWarningDialog(false);
        setPendingAction(null);
      });
    } else {
      proceedWithLoad();
    }
  }, [workspaceSlug, postSlug]);

  // Load post data when fetched
  useEffect(() => {
    if (post && isEditing) {
      const editor = editorRef.current?.editor;
      if (editor && post.content?.contentJson) {
        editor.commands.setContent(post.content.contentJson);
      }

      setMetadata({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        authorId: post.author?.id,
        categorySlug: post.category?.slug,
        tagSlugs: post.tags.map((tag) => tag.slug),
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        visible: post.visible,
        status: post.status,
      });
    }
  }, [post, isEditing]);

  useEffect(() => {
    if (postSlug && isEditing) {
      if (
        metadata.title ||
        metadata.excerpt ||
        metadata.categorySlug ||
        metadata.authorId ||
        metadata.tagSlugs?.length
      ) {
        saveMetadata(metadata, workspaceSlug);
      }
    }
  }, [metadata, workspaceSlug, postSlug, isEditing]);

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditing) {
      setMetadata((prev) => ({
        ...prev,
        title: e.target.value,
      }));
    } else {
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
    }
  };

  const handleCancelWarning = () => {
    setShowWarningDialog(false);
    setPendingAction(null);
    if (previousPostSlugRef.current !== undefined) {
      if (previousPostSlugRef.current) {
        navigate(`/dashboard/${workspaceSlug}/editor/${previousPostSlugRef.current}`);
      } else {
        navigate(`/dashboard/${workspaceSlug}/editor`);
      }
    } else {
      navigate(`/dashboard/${workspaceSlug}/posts`);
    }
  };

  const handleGoBack = () => {
    navigate(`/dashboard/${workspaceSlug}/posts`);
  };

  if (isLoadingPost && postSlug) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Spinner className='h-8 w-8' />
          <p className='text-sm text-muted-foreground'>Loading post...</p>
        </div>
      </div>
    );
  }

  if (isPostError && postSlug) {
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

  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className='h-full p-6 flex flex-col overflow-y-scroll'>
          <MetadataForm
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            metadata={metadata}
            setMetadata={setMetadata}
            onTitleChange={onTitleChange}
            editorRef={editorRef as React.RefObject<TiptapHandle>}
            workspaceSlug={workspaceSlug ?? ''}
            postSlug={postSlug || undefined}
            isEditing={isEditing}
          />
          <div className='mt-6 flex-1 min-h-0'>
            <Tiptap ref={editorRef} workspaceSlug={workspaceSlug} />
          </div>
        </div>
      </ErrorBoundary>

      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Draft?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in your draft. {postSlug ? `Loading post "${postSlug}"` : 'Starting a new post'} will overwrite your
              current draft. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={handleCancelWarning}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                if (pendingAction) {
                  pendingAction();
                }
              }}
            >
              Discard Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
