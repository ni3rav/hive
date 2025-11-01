import type { Category, CategoryFormData } from '@/types/category';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface CategoryFormProps {
  initialData: Category | null;
  onSave: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function CategoryForm({
  initialData,
  onSave,
  onCancel,
  isSubmitting,
}: CategoryFormProps) {
  const isEditing = !!initialData;

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional().default(''),
      }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  const nameValue = watch('name');
  const isValid = isEditing ? isDirty : nameValue && nameValue.trim().length > 0;

  const onSubmit = handleSubmit(async (data: CategoryFormData) => {
    if (!data.name || !data.name.trim()) {
      return;
    }
    await onSave(data);
  });

  return (
    <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Category' : 'Create New Category'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update the details for this category.'
            : 'Add a new category to your workspace.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              {...register('name')}
              placeholder="Category name (e.g., 'Technology')"
              required
            />
            {errors.name?.message && (
              <p className='text-sm text-destructive'>{errors.name.message}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description (Optional)</Label>
            <Textarea
              id='description'
              {...register('description')}
              placeholder='Share a brief description of this category.'
            />
             {errors.description?.message && (
              <p className='text-sm text-destructive'>{errors.description.message}</p>
            )}
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='ghost'
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}