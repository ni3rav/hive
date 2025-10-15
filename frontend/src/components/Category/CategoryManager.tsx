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
  useDeleteCategory,
  useCreateCategory,
  useUpdateCategory,
  useUserCategories,
} from '@/hooks/useCategory';
import type { Category, CreateCategoryData } from '@/types/category';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
type CategoryFormData = Partial<Omit<CreateCategoryData, 'slug'>>;

export default function CategoriesManager() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { data: categories, isLoading, isError } = useUserCategories();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setView('create');
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setView('edit');
  };

  const onDeleteCategory = (categoryId: string) => {
    setPendingDeleteId(categoryId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteCategoryMutation.mutate(pendingDeleteId, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setPendingDeleteId(null);
      },
    });
  };

  const cancelDelete = () => {
    setIsDeleteOpen(false);
    setPendingDeleteId(null);
  };

  const handleSaveCategory = (categoryData: CategoryFormData) => {
    if (view === 'create') {
      createCategoryMutation.mutate(categoryData as Omit<CreateCategoryData, 'slug'>, {
        onSuccess: () => {
          setView('list');
        },
      });
    } else if (view === 'edit' && selectedCategory?.id) {
      updateCategoryMutation.mutate(
        { categoryId: selectedCategory.id, data: categoryData },
        {
          onSuccess: () => {
            setView('list');
            setSelectedCategory(null);
          },
        },
      );
    }
  };

  const handleCancel = () => {
    setView('list');
    setSelectedCategory(null);
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
        <CategoryForm
          initialData={null}
          onSave={handleSaveCategory}
          onCancel={handleCancel}
          isSubmitting={createCategoryMutation.isPending}
        />
      );
    }
    return (
      <div className='p-6'>
        <CategoryList
          categories={[]}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={onDeleteCategory}
        />
      </div>
    );
  }

  return (
    <>
      <div className='p-6'>
        {view === 'list' ? (
          <CategoryList
            categories={Array.isArray(categories) ? categories : []}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={onDeleteCategory}
          />
        ) : (
          <CategoryForm
            initialData={selectedCategory}
            onSave={handleSaveCategory}
            onCancel={handleCancel}
            isSubmitting={
              createCategoryMutation.isPending || updateCategoryMutation.isPending
            }
          />
        )}
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              category and remove it from any associated posts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={cancelDelete} disabled={deleteCategoryMutation.isPending}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDelete} disabled={deleteCategoryMutation.isPending}>
              {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}