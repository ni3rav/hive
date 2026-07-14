import { useMemo, useRef } from 'react';
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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export function RegisterForm({
  onRegSubmit,
  onLoginClick,
  isPending = false,
  className,
  ...props
}: {
  onRegSubmit: (
    name: string,
    email: string,
    password: string,
  ) => void | Promise<void>;
  onLoginClick: () => void;
  isPending?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.email('Enter a valid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
      }),
    [],
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<{ name: string; email: string; password: string }>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onChange',
  });

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
          <CardTitle className='text-xl'>🐝 Join the Hive</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(
              (v) => onRegSubmit(v.name, v.email, v.password),
              () => focusFirstError(),
            )}
          >
            <div className='grid gap-6'>
              <div className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    type='text'
                    placeholder='Your Name'
                    required
                    disabled={isPending}
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
                  <Label htmlFor='password'>Password</Label>
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
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
              <div className='text-center text-sm'>
                Already have an account?{' '}
                <a
                  href='#'
                  className='underline underline-offset-4'
                  onClick={(e) => {
                    e.preventDefault();
                    onLoginClick();
                  }}
                >
                  Sign in
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
