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
  useDeleteTag,
  useCreateTag,
  useUpdateTag,
  useWorkspaceTags,
} from '@/hooks/useTag';
import type { Tag, CreateTagData } from '@/types/tag';
import TagList from './TagList';
import TagForm from './TagForm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';

export default function TagsManager() {
  const workspaceSlug = useWorkspaceSlug();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const { data: tags, isLoading, isError } = useWorkspaceTags(workspaceSlug!);
  const createTagMutation = useCreateTag(workspaceSlug!);
  const updateTagMutation = useUpdateTag(workspaceSlug!);
  const deleteTagMutation = useDeleteTag(workspaceSlug!);

  const [pendingDeleteSlug, setPendingDeleteSlug] = useState<string | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleAddTag = () => {
    setSelectedTag(null);
    setView('create');
  };

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setView('edit');
  };

  const onDeleteTag = (tagSlug: string) => {
    setPendingDeleteSlug(tagSlug);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteSlug) return;
    deleteTagMutation.mutate(pendingDeleteSlug, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setPendingDeleteSlug(null);
      },
    });
  };

  const cancelDelete = () => {
    setIsDeleteOpen(false);
    setPendingDeleteSlug(null);
  };

  const handleSaveTag = async (tagData: CreateTagData) => {
    if (!workspaceSlug) return;

    if (view === 'create') {
      await createTagMutation.mutateAsync(tagData);
      setView('list');
    } else if (view === 'edit' && selectedTag) {
      await updateTagMutation.mutateAsync({
        tagSlug: selectedTag.slug,
        data: tagData,
      });
      setSelectedTag(null);
      setView('list');
    }
  };

  const handleCancel = () => {
    setView('list');
    setSelectedTag(null);
  };

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
    if (view === 'create') {
      return (
        <TagForm
          initialData={null}
          onSave={handleSaveTag}
          onCancel={handleCancel}
          isSubmitting={createTagMutation.isPending}
        />
      );
    }
    return (
      <div className='p-6'>
        <TagList
          tags={[]}
          onAddTag={handleAddTag}
          onEditTag={handleEditTag}
          onDeleteTag={onDeleteTag}
        />
      </div>
    );
  }

  return (
    <>
      <div className='p-6'>
        {view === 'list' ? (
          <TagList
            tags={Array.isArray(tags) ? tags : []}
            onAddTag={handleAddTag}
            onEditTag={handleEditTag}
            onDeleteTag={onDeleteTag}
          />
        ) : (
          <TagForm
            initialData={selectedTag}
            onSave={handleSaveTag}
            onCancel={handleCancel}
            isSubmitting={
              createTagMutation.isPending || updateTagMutation.isPending
            }
          />
        )}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete tag</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the tag
              and remove it from any associated posts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={cancelDelete}
              disabled={deleteTagMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={deleteTagMutation.isPending}
            >
              {deleteTagMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

