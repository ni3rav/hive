import { useState } from 'react';
import type { Category } from '@/types/category';
import { useCategories, useDeleteCategory, useSaveCategory } from '@/hooks/useCategory';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';

export default function CategoriesManager() {
  const { data, isLoading } = useCategories();
  const save = useSaveCategory();
  const del = useDeleteCategory();

  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <div className='p-6 text-sm text-muted-foreground'>Loading categories...</div>;

  return showForm ? (
    <CategoryForm
      initialData={editing}
      isSubmitting={save.isPending}
      onCancel={() => { setShowForm(false); setEditing(null); }}
      onSave={async (payload) => { await save.mutateAsync(payload); setShowForm(false); setEditing(null); }}
    />
  ) : (
    <CategoryList
      categories={data}
      onAddCategory={() => { setEditing(null); setShowForm(true); }}
      onEditCategory={(c) => { setEditing(c); setShowForm(true); }}
      onDeleteCategory={(id) => del.mutate(id)}
    />
  );
}