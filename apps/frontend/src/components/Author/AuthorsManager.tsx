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
  useDeleteAuthor,
  useCreateAuthor,
  useUpdateAuthor,
  useWorkspaceAuthors,
} from '@/hooks/useAuthor';
import type { Author, CreateAuthorData } from '@/types/author';
import AuthorList from './AuthorList';
import AuthorForm from './AuthorForm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';

export default function AuthorsManager() {
  const workspaceSlug = useWorkspaceSlug();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  const {
    data: authors,
    isLoading,
    isError,
  } = useWorkspaceAuthors(workspaceSlug!);

  const createAuthorMutation = useCreateAuthor(workspaceSlug!);
  const updateAuthorMutation = useUpdateAuthor(workspaceSlug!);
  const deleteAuthorMutation = useDeleteAuthor(workspaceSlug!);

  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleAddAuthor = () => {
    setSelectedAuthor(null);
    setView('create');
  };

  const handleEditAuthor = (author: Author) => {
    setSelectedAuthor(author);
    setView('edit');
  };

  const onDeleteAuthor = (authorId: string) => {
    setPendingDeleteIds([authorId]);
    setIsDeleteOpen(true);
  };

  const onDeleteSelected = (authorIds: string[]) => {
    setPendingDeleteIds(authorIds);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteIds.length === 0) return;
    
    for (const id of pendingDeleteIds) {
      await deleteAuthorMutation.mutateAsync(id);
    }
    setIsDeleteOpen(false);
    setPendingDeleteIds([]);
  };

  const cancelDelete = () => {
    setIsDeleteOpen(false);
    setPendingDeleteIds([]);
  };

  const handleSaveAuthor = (
    authorData: CreateAuthorData | Partial<CreateAuthorData>,
  ) => {
    if (view === 'create') {
      createAuthorMutation.mutate(authorData as CreateAuthorData, {
        onSuccess: () => {
          // --- CHANGE: Toast removed, handled by hook ---
          setView('list');
        },
      });
    } else if (view === 'edit' && selectedAuthor?.id) {
      updateAuthorMutation.mutate(
        { authorId: selectedAuthor.id, data: authorData },
        {
          onSuccess: () => {
            // --- CHANGE: Toast removed, handled by hook ---
            setView('list');
          },
        },
      );
    }
  };

  const handleCancel = () => {
    setView('list');
    setSelectedAuthor(null);
  };

  if (isLoading) {
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
    if (view === 'create') {
      return (
        <div className='p-6'>
          <AuthorForm
            initialData={null}
            onSave={handleSaveAuthor}
            onCancel={handleCancel}
            isSubmitting={createAuthorMutation.isPending}
          />
        </div>
      );
    }
    return (
      <div className='p-6'>
        <AuthorList
          authors={[]}
          onAddAuthor={handleAddAuthor}
          onEditAuthor={handleEditAuthor}
          onDeleteAuthor={onDeleteAuthor}
        />
      </div>
    );
  }

  return (
    <>
      <div className='p-6'>
        {view === 'list' ? (
          <AuthorList
            authors={Array.isArray(authors) ? authors : []}
            onAddAuthor={handleAddAuthor}
            onEditAuthor={handleEditAuthor}
            onDeleteAuthor={onDeleteAuthor}
            onDeleteSelected={onDeleteSelected}
          />
        ) : (
          <AuthorForm
            initialData={selectedAuthor}
            onSave={handleSaveAuthor}
            onCancel={handleCancel}
            isSubmitting={
              createAuthorMutation.isPending || updateAuthorMutation.isPending
            }
          />
        )}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingDeleteIds.length > 1
                ? `Delete ${pendingDeleteIds.length} authors`
                : 'Delete author'}
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {pendingDeleteIds.length > 1
                ? `${pendingDeleteIds.length} authors.`
                : 'the author.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={cancelDelete}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={deleteAuthorMutation.isPending}
            >
              {deleteAuthorMutation.isPending
                ? 'Deleting...'
                : pendingDeleteIds.length > 1
                  ? `Delete ${pendingDeleteIds.length} authors`
                  : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
