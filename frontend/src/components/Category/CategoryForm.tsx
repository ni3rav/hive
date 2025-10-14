import React, { useState } from 'react';
import type { Category } from '@/types/category';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type Props = {
  initialData?: Category | null;
  onSave: (data: Category | ({ id: string } & Partial<Omit<Category, 'id'>>)) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export default function CategoryForm({ initialData, onSave, onCancel, isSubmitting }: Props) {
  const isEditing = !!initialData;
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
  });

  // keep a stable 4-char suffix during this create session
  const suffixRef = React.useRef<string>(Math.random().toString(36).slice(2, 6));

  const toSlugBase = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const buildSlug = (name: string) => {
    const base = toSlugBase(name);
    return base ? `${base}-${suffixRef.current}` : '';
  };

  // Auto-generate slug while creating (do not auto-change on edit)
  React.useEffect(() => {
    if (!isEditing) {
      setForm((prev) => ({ ...prev, slug: buildSlug(prev.name) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, isEditing]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && initialData?.id) {
      // send only changed fields (PATCH)
      const changes: Record<string, unknown> = {};
      if (form.name !== initialData.name) changes.name = form.name;
      if (form.slug !== (initialData.slug ?? '')) changes.slug = form.slug;
      if ((form.description ?? '') !== (initialData.description ?? '')) changes.description = form.description;
      onSave({ id: initialData.id, ...changes });
    } else {
      // ensure slug exists for create
      const payload = {
        name: form.name,
        slug: form.slug || buildSlug(form.name),
        description: form.description,
      };
      onSave(payload as Category);
    }
  };

  return (
    <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Category' : 'Create Category'}</CardTitle>
        <CardDescription>{isEditing ? 'Update this category.' : 'Add a new category.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='slug'>Slug</Label>
            <Input id='slug' value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea id='description' value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className='flex justify-end gap-3'>
            <Button type='button' variant='ghost' onClick={onCancel}>Cancel</Button>
            <Button type='submit' disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}