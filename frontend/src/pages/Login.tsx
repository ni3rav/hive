import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoginForm } from '@/components/login.tsx';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema } from '@/lib/validations/auth';
import { getErrorMessage, getStatusMessage } from '@/lib/error-utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();

  const handleLogin = (email: string, password: string) => {
    const validatedData = loginSchema.safeParse({
      email,
      password,
    });
    if (!validatedData.success) {
      toast.error('Invalid email or password');
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          const status = error.response?.status;
          const statusMessage = getStatusMessage(status);
          const errorMessage = getErrorMessage(error);

          // Custom messages for specific login errors
          const customMap: Record<number, string> = {
            404: 'User not found. Please check your email or register.',
            401: 'Incorrect password. Please try again.',
          };

          const message =
            (status && customMap[status]) ||
            errorMessage ||
            statusMessage ||
            'An unexpected error occurred.';
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
