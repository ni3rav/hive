import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/lib/validations/auth';

export function ForgotPasswordForm({
  onFormSubmit,
  onBackToLogin,
  isPending = false,
  className,
  ...props
}: {
  onFormSubmit: (email: string) => void | Promise<void>;
  onBackToLogin: () => void;
  isPending?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => onFormSubmit(v.email))}>
            <div className='grid gap-6'>
              <div className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='m@example.com'
                    required
                    disabled={isPending}
                    {...register('email')}
                  />
                  {errors.email?.message && (
                    <p className='text-sm text-destructive'>
                      {errors.email.message}
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
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
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
