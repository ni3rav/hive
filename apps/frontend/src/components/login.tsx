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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '@/lib/validations/auth';

export function LoginForm({
  onFormSubmit,
  onSignupClick,
  isPending = false,
  className,
  ...props
}: {
  onFormSubmit: (email: string, password: string) => void | Promise<void>;
  onSignupClick: () => void;
  isPending?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<{ email: string; password: string }>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const focusFirstError = () => {
    setTimeout(() => {
      if (errors.email && emailInputRef.current) {
        emailInputRef.current.focus();
        emailInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else if (errors.password && passwordInputRef.current) {
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
          <CardTitle className='text-xl'>🐝 Welcome back to Hive</CardTitle>
          <CardDescription>
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(
              (v) => onFormSubmit(v.email, v.password),
              () => focusFirstError(),
            )}
          >
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
                <div className='grid gap-3'>
                  <div className='flex items-center'>
                    <Label htmlFor='password'>Password</Label>
                    <a
                      href='#'
                      className='ml-auto text-sm underline-offset-4 hover:underline'
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/forgot-password');
                      }}
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <PasswordInput
                    id='password'
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
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
              <div className='text-center text-sm'>
                Don&apos;t have an account?{' '}
                <a
                  href='#'
                  className='underline underline-offset-4'
                  onClick={(e) => {
                    e.preventDefault();
                    onSignupClick();
                  }}
                >
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className='text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4'>
        By clicking continue, you agree to our <a href='#'>Terms of Service</a>{' '}
        and <a href='#'>Privacy Policy</a>.
      </div>
    </div>
  );
}
