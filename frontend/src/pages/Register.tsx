import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterForm } from '@/components/register';
import { useRegister } from '@/hooks/useAuth';
import { registerSchema } from '@/lib/validations/auth';
import { getErrorMessage, getStatusMessage } from '@/lib/error-utils';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register } = useRegister();

  const handleRegister = (name: string, email: string, password: string) => {
    //* zod validations for registration
    const validatedData = registerSchema.safeParse({
      name,
      email,
      password,
    });
    if (!validatedData.success) {
      console.log('validatedData', validatedData.error);
      toast.error('please enter a valid name, email and password');
      return;
    }
    const {
      name: validatedName,
      email: validatedEmail,
      password: validatedPassword,
    } = validatedData.data;

    register(
      {
        name: validatedName,
        email: validatedEmail,
        password: validatedPassword,
      },
      {
        onSuccess: () => {
          toast.success('Registration successful!.');
          navigate('/dashboard');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          const status: number | undefined = error.response?.status;
          const statusMessage = getStatusMessage(status);
          const errorMessage = getErrorMessage(error);

          // custom messages for specific cases
          const customMap: Record<number, string> = {
            409: 'This email is already registered. Please log in.',
          };

          const message =
            (status !== undefined && customMap[status]) ||
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
      <RegisterForm
        onRegSubmit={handleRegister}
        onLoginClick={() => navigate('/login')}
      />
    </div>
  );
}
