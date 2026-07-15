import { useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, FileDown } from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { useWorkspacePosts, useDeletePost } from '@/hooks/usePost';
import { DataTable } from './data-table';
import { ImportMarkdownDialog } from './ImportMarkdownDialog';
import { createColumns } from './columns';
import { useNavigate } from 'react-router-dom';
import type { Post } from '@/types/post';

export default function PostsManager() {
  const workspaceSlug = useWorkspaceSlug();
  const navigate = useNavigate();
  const { data: posts, isLoading, isError } = useWorkspacePosts(workspaceSlug!);
  const deletePostMutation = useDeletePost(workspaceSlug!);

  const [pendingDeleteSlugs, setPendingDeleteSlugs] = useState<string[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleNewPost = () => {
    navigate(`/dashboard/${workspaceSlug}/editor`);
  };

  const handleImportMarkdown = (raw: string) => {
    navigate(`/dashboard/${workspaceSlug}/editor`, {
      state: { markdownImport: { raw } },
    });
  };

  const handleEdit = (postSlug: string) => {
    navigate(`/dashboard/${workspaceSlug}/editor/${postSlug}`);
  };

  const handleDelete = (postSlug: string) => {
    setPendingDeleteSlugs([postSlug]);
    setIsDeleteOpen(true);
  };

  const handleDeleteSelected = (postSlugs: string[]) => {
    setPendingDeleteSlugs(postSlugs);
    setIsDeleteOpen(true);
  };

  const tableColumns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  const confirmDelete = async () => {
    if (pendingDeleteSlugs.length === 0) return;
    
    for (const slug of pendingDeleteSlugs) {
      await deletePostMutation.mutateAsync(slug);
    }
    setIsDeleteOpen(false);
    setPendingDeleteSlugs([]);
  };

  const cancelDelete = () => {
    setIsDeleteOpen(false);
    setPendingDeleteSlugs([]);
  };

  const getRowSlug = (row: Post) => row.slug;

  if (isLoading || !workspaceSlug) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className='h-6 w-40' />
            </CardTitle>
            <CardDescription>
              <Skeleton className='h-4 w-64' />
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <div className='space-y-3'>
              <Skeleton className='h-14 w-full' />
              <Skeleton className='h-14 w-full' />
              <Skeleton className='h-14 w-full' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Posts</CardTitle>
              <CardDescription>Manage your blog posts</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Empty className='border-dashed'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>Error loading posts</EmptyTitle>
                <EmptyDescription>
                  There was an error loading your posts. Please try again.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  const postsArray = Array.isArray(posts) ? posts : [];

  return (
    <>
      <div className='p-6'>
        <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
          <CardHeader>
            <div>
              <CardTitle>Posts</CardTitle>
              <CardDescription>Manage your posts</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {postsArray.length === 0 ? (
              <Empty className='border-dashed animate-in fade-in-50'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <FileText />
                  </EmptyMedia>
                  <EmptyTitle>No Posts Yet</EmptyTitle>
                  <EmptyDescription>
                    You haven't created any posts yet. Get started by creating
                    your first post.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setIsImportOpen(true)}
                    >
                      <FileDown />
                      Import
                    </Button>
                    <Button onClick={handleNewPost} size='sm'>
                      <Plus />
                      Create Post
                    </Button>
                  </div>
                </EmptyContent>
              </Empty>
            ) : (
              <DataTable
                columns={tableColumns}
                data={postsArray}
                onNewPost={handleNewPost}
                onImportMarkdown={() => setIsImportOpen(true)}
                onEdit={handleEdit}
                onDeleteSelected={handleDeleteSelected}
                getRowSlug={getRowSlug}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ImportMarkdownDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onFileReady={handleImportMarkdown}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingDeleteSlugs.length > 1
                ? `Delete ${pendingDeleteSlugs.length} posts`
                : 'Delete post'}
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {pendingDeleteSlugs.length > 1
                ? `${pendingDeleteSlugs.length} posts and all their content.`
                : 'the post and all its content.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={cancelDelete}
              disabled={deletePostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending
                ? 'Deleting...'
                : pendingDeleteSlugs.length > 1
                  ? `Delete ${pendingDeleteSlugs.length} posts`
                  : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
