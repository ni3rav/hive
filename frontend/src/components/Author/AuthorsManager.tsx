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
  useUserAuthors,
} from '@/hooks/useAuthor';
import type { Author } from '@/types/author';
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

export default function AuthorsManager() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  const { data: authors, isLoading, isError } = useUserAuthors();

  const createAuthorMutation = useCreateAuthor();
  const updateAuthorMutation = useUpdateAuthor();
  const deleteAuthorMutation = useDeleteAuthor();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
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
    setPendingDeleteId(authorId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteAuthorMutation.mutate(pendingDeleteId, {
      onSettled: () => {
        setIsDeleteOpen(false);
        setPendingDeleteId(null);
      },
    });
  };

  const cancelDelete = () => {
    setIsDeleteOpen(false);
    setPendingDeleteId(null);
  };

  const handleSaveAuthor = (authorData: Author | Partial<Author>) => {
    if (view === 'create') {
      createAuthorMutation.mutate(authorData as Author, {
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
        <AuthorForm
          initialData={null}
          onSave={handleSaveAuthor}
          onCancel={handleCancel}
          isSubmitting={createAuthorMutation.isPending}
        />
      );
    }
    return (
      <AuthorList
        authors={[]}
        onAddAuthor={handleAddAuthor}
        onEditAuthor={handleEditAuthor}
        onDeleteAuthor={onDeleteAuthor}
      />
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
            <DialogTitle>Delete author</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              author.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={cancelDelete}
              disabled={deleteAuthorMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={deleteAuthorMutation.isPending}
            >
              {deleteAuthorMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
