import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUserAuthors, useCreateAuthor, useUpdateAuthor, useDeleteAuthor } from '@/hooks/useAuthor';
import type { Author } from '@/types/author';
import AuthorList from './AuthorList';
import AuthorForm from './AuthorForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthorsManager() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  const { data: authors, isLoading, isError, error } = useUserAuthors();

  const createAuthorMutation = useCreateAuthor();
  const updateAuthorMutation = useUpdateAuthor();
  const deleteAuthorMutation = useDeleteAuthor();

  // This useEffect handles the redirect when no authors are found
  useEffect(() => {
    if (isError && (error as Error)?.message === 'NOT_FOUND') {
      setView('create');
      toast.info("You don't have an author profile yet. Let's create one!");
    }
  }, [isError, error]);

  const handleAddAuthor = () => {
    setSelectedAuthor(null);
    setView('create');
  };

  const handleEditAuthor = (author: Author) => {
    setSelectedAuthor(author);
    setView('edit');
  };

  const handleDeleteAuthor = (authorId: string) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      deleteAuthorMutation.mutate(authorId, {
        onSuccess: () => toast.success('Author deleted successfully!'),
      });
    }
  };

  const handleSaveAuthor = (authorData: Author) => {
    if (view === 'create') {
      createAuthorMutation.mutate(authorData, {
        onSuccess: () => {
          toast.success('Author created successfully!');
          setView('list');
        },
      });
    } else if (view === 'edit' && selectedAuthor?.id) {
      updateAuthorMutation.mutate(
        { authorId: selectedAuthor.id, data: authorData },
        {
          onSuccess: () => {
            toast.success('Author updated successfully!');
            setView('list');
          },
        }
      );
    }
  };

  const handleCancel = () => {
    setView('list');
    setSelectedAuthor(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
            <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show a generic error if it's NOT our special 'NOT_FOUND' error.
  if (isError && (error as Error)?.message !== 'NOT_FOUND') {
    return <div className="p-8 text-center text-red-500">Error fetching authors.</div>;
  }

  return (
    <div className="p-6">
      {view === 'list' ? (
        <AuthorList
          authors={Array.isArray(authors) ? authors : []}
          onAddAuthor={handleAddAuthor}
          onEditAuthor={handleEditAuthor}
          onDeleteAuthor={handleDeleteAuthor}
        />
      ) : (
        <AuthorForm
          initialData={selectedAuthor}
          onSave={handleSaveAuthor}
          onCancel={handleCancel}
          isSubmitting={createAuthorMutation.isPending || updateAuthorMutation.isPending}
        />
      )}
    </div>
  );
}