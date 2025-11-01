import { useMemo, useRef } from 'react';
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
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

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

  const focusFirstError = () => {
    setTimeout(() => {
      if (errors.name && nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else if (errors.email && emailInputRef.current) {
        emailInputRef.current.focus();
        emailInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  };

  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your name and email address</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit, () => focusFirstError())}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              type='text'
              placeholder='Enter your name'
              {...register('name')}
              ref={(e) => {
                register('name').ref(e);
                nameInputRef.current = e;
              }}
              className={
                errors.name
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.name?.message && (
              <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                {errors.name.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='Enter your email'
              {...register('email')}
              ref={(e) => {
                register('email').ref(e);
                emailInputRef.current = e;
              }}
              className={
                errors.email
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }
            />
            {errors.email?.message && (
              <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                {errors.email.message}
              </p>
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
