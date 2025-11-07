import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoginForm } from '@/components/login.tsx';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema } from '@/lib/validations/auth';
import { getAuthErrorMessage } from '@/lib/error-utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();

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
          navigate('/dashboard');
        },
        onError: (error: unknown) => {
          const apiError = error as { response?: { status?: number } };
          
          // Handle email not verified (403)
          if (apiError.response?.status === 403) {
            toast.error('Email not verified. Please check your email for verification link.');
            return;
          }
          
          const message = getAuthErrorMessage(error, 'login', 'Login failed');
          toast.error(message);
        },
      },
    );
  };

  return (
    <div className='w-screen h-screen grid place-items-center'>
      <LoginForm
        onFormSubmit={handleLogin}
        onSignupClick={() => navigate('/register')}
        isPending={isPending}
      />
    </div>
  );
}
