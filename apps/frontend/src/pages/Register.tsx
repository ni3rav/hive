import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterForm } from '@/components/register';
import { useRegister } from '@/hooks/useAuth';
import { registerSchema } from '@/lib/validations/auth';
import { getAuthErrorMessage } from '@/lib/error-utils';
import { useHead } from '@unhead/react';
import { createAuthPageSEOMetadata } from '@/lib/seo';

export default function RegisterPage() {
  useHead(createAuthPageSEOMetadata('register'));
  const navigate = useNavigate();
  const { mutate: register, isPending } = useRegister();

  const handleRegister = (name: string, email: string, password: string) => {
    const validatedData = registerSchema.safeParse({
      name,
      email,
      password,
    });
    if (!validatedData.success) {
      toast.error('Please enter a valid name, email and password');
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
          toast.success(
            'Registration successful! Please check your email to verify your account.',
          );
          navigate(`/verify?email=${validatedEmail}`);
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
    <div className='w-screen h-screen grid place-items-center p-4'>
      <RegisterForm
        onRegSubmit={handleRegister}
        onLoginClick={() => navigate('/login')}
        isPending={isPending}
      />
    </div>
  );
}
