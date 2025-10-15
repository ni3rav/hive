import type { Category, CreateCategoryData } from '@/types/category';
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
type CategoryFormData = Partial<Omit<CreateCategoryData, 'slug'>>;

interface CategoryFormProps {
  initialData?: Category | null;
  onSave: (data: CategoryFormData) => void;
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
    formState: { errors },
    watch,
  } = useForm<Pick<CreateCategoryData, 'name' | 'description'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
    mode: 'onChange',
  });

  const onSubmit = (
    values: Pick<CreateCategoryData, 'name' | 'description'>,
  ) => {
    if (!isEditing) {
      onSave({
        name: values.name,
        description: values.description,
      });
      return;
    }
    const changedFields: CategoryFormData = {};

    if (values.name !== initialData?.name) {
      changedFields.name = values.name;
    }
    if (values.description !== initialData?.description) {
      changedFields.description = values.description;
    }
    if (Object.keys(changedFields).length > 0) {
      onSave(changedFields);
    }
  };

  const hasChanges = useMemo(() => {
    if (!isEditing) return true;
    const currentValues = watch();
    return (
      currentValues.name !== initialData?.name ||
      (currentValues.description || '') !== (initialData?.description || '')
    );
  }, [isEditing, initialData, watch]);

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
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
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
              disabled={isSubmitting || (isEditing && !hasChanges)}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}