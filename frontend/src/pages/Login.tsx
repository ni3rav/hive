import { useNavigate, useLocation, type Location } from 'react-router-dom';
import { toast } from 'sonner';
import { LoginForm } from '@/components/login.tsx';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema } from '@/lib/validations/auth';
import { getAuthErrorMessage } from '@/lib/error-utils';
import { useHead } from '@unhead/react';
import { createAuthPageSEOMetadata } from '@/lib/seo';

export default function LoginPage() {
  useHead(createAuthPageSEOMetadata('login'));
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: login, isPending } = useLogin();

  const from =
    (location.state as { from?: Location })?.from?.pathname &&
    (location.state as { from?: Location })?.from?.pathname !== '/login'
      ? (location.state as { from?: Location })?.from?.pathname
      : '/dashboard';

  const handleLogin = (email: string, password: string) => {
    const validatedData = loginSchema.safeParse({
      email,
      password,
    });
    if (!validatedData.success) {
      toast.error('Please enter a valid email and password');
      return;
    }
    const { email: validatedEmail, password: validatedPassword } =
      validatedData.data;

    login(
      { email: validatedEmail, password: validatedPassword },
      {
        onSuccess: () => {
          toast.success('Login successful! Welcome back.');
          navigate(from ?? '/dashboard', { replace: true });
        },
        onError: (error: unknown) => {
          const apiError = error as { response?: { status?: number } };

          // Handle email not verified (403)
          if (apiError.response?.status === 403) {
            toast.error(
              'Email not verified. Please check your email for verification link.',
            );
            return;
          }

          const message = getAuthErrorMessage(error, 'login', 'Login failed');
          toast.error(message);
        },
      },
    );
  };

  return (
    <div className='w-screen h-screen grid place-items-center p-4'>
      <LoginForm
        onFormSubmit={handleLogin}
        onSignupClick={() => navigate('/register')}
        isPending={isPending}
      />
    </div>
  );
}
