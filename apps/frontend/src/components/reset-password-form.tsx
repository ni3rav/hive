import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/lib/validations/auth';

export function ResetPasswordForm({
  onFormSubmit,
  onBackToLogin,
  isPending = false,
  email = '',
  token = '',
  className,
  ...props
}: {
  onFormSubmit: (
    email: string,
    token: string,
    password: string,
  ) => void | Promise<void>;
  onBackToLogin: () => void;
  isPending?: boolean;
  email?: string;
  token?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<{ password: string }>({
    resolver: zodResolver(resetPasswordSchema.pick({ password: true })),
    defaultValues: { password: '' },
    mode: 'onChange',
  });

  const focusFirstError = () => {
    setTimeout(() => {
      if (errors.password && passwordInputRef.current) {
        passwordInputRef.current.focus();
        passwordInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(
              (v) => onFormSubmit(email, token, v.password),
              () => focusFirstError(),
            )}
          >
            <div className='grid gap-6'>
              <div className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='password'>New Password</Label>
                  <PasswordInput
                    id='password'
                    placeholder='Enter new password'
                    required
                    disabled={isPending}
                    {...register('password')}
                    ref={(e) => {
                      register('password').ref(e);
                      passwordInputRef.current = e;
                    }}
                    className={
                      errors.password
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                  />
                  {errors.password?.message && (
                    <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={isPending || !isDirty}
                >
                  {isPending ? (
                    <>
                      <Spinner className='mr-2' />
                      Resetting password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
              <div className='text-center text-sm'>
                Remember your password?{' '}
                <a
                  href='#'
                  className='underline underline-offset-4'
                  onClick={(e) => {
                    e.preventDefault();
                    onBackToLogin();
                  }}
                >
                  Back to login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
