import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEditProfile } from '@/hooks/userProfile';
import { type User } from '@/types/auth';
import { Check, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage } from '@/lib/error-utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface EditProfileFormProps {
  user: User;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function EditProfileForm({
  user,
  onCancel,
  onSuccess,
}: EditProfileFormProps) {
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().optional(),
        email: z.email('Please enter a valid email address').optional(),
      }),
    [],
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<{ name?: string; email?: string }>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, email: user.email },
    mode: 'onChange',
  });

  const editProfileMutation = useEditProfile();

  const onSubmit = async (values: { name?: string; email?: string }) => {
    const updateData: { name?: string; email?: string } = {};
    const name = (values.name || '').trim();
    const email = (values.email || '').trim();

    if (name && name !== user.name) updateData.name = name;
    if (email && email !== user.email) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      onCancel();
      return;
    }

    editProfileMutation.mutate(updateData, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error: unknown) => {
        const errorMessage = getErrorMessage(error, 'Failed to update profile');
        // Show a general inline error under the form
        // (we can also toast if you prefer)
        console.error(errorMessage);
      },
    });
  };

  const hasChanges =
    (watch('name') || '').trim() !== user.name ||
    (watch('email') || '').trim() !== user.email;

  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your name and email address</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              type='text'
              placeholder='Enter your name'
              className={errors.name ? 'border-destructive' : ''}
              {...register('name')}
            />
            {errors.name?.message && (
              <p className='text-sm text-destructive'>{errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='Enter your email'
              className={errors.email ? 'border-destructive' : ''}
              {...register('email')}
            />
            {errors.email?.message && (
              <p className='text-sm text-destructive'>{errors.email.message}</p>
            )}
          </div>

          {/* General error is now surfaced via toast/console in onError */}

          <div className='flex gap-2 pt-4'>
            <Button
              type='submit'
              disabled={editProfileMutation.isPending || !hasChanges}
              className='flex-1'
            >
              {editProfileMutation.isPending ? (
                <>
                  <Spinner className='mr-2' />
                  Updating...
                </>
              ) : (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={editProfileMutation.isPending}
              className='flex-1'
            >
              <X className='mr-2 h-4 w-4' />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
