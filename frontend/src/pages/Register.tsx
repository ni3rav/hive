import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterForm } from '@/components/register';
import { useRegister } from '@/hooks/useAuth';
import { registerSchema } from '@/lib/validations/auth';
import { getAuthErrorMessage } from '@/lib/error-utils';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register, isPending } = useRegister();

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
        onError: (error: unknown) => {
          const message = getAuthErrorMessage(
            error,
            'register',
            'Registration failed',
          );
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
        isPending={isPending}
      />
    </div>
  );
}
