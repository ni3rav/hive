import { useNavigate } from 'react-router-dom';
import { ForgotPasswordForm } from '@/components/forgot-password-form';
import { useForgotPassword } from '@/hooks/useAuth';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { toast } from 'sonner';
import { useHead } from '@unhead/react';
import { createAuthPageSEOMetadata } from '@/lib/seo';

export default function ForgotPasswordPage() {
  useHead(createAuthPageSEOMetadata('forgot-password'));
  const navigate = useNavigate();
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleForgotPassword = (email: string) => {
    const validatedData = forgotPasswordSchema.safeParse({ email });
    if (!validatedData.success) {
      toast.error('Please enter a valid email');
      return;
    }
    const { email: validatedEmail } = validatedData.data;

    forgotPassword({ email: validatedEmail });
  };

  return (
    <div className='w-screen h-screen grid place-items-center p-4'>
      <ForgotPasswordForm
        onFormSubmit={handleForgotPassword}
        onBackToLogin={() => navigate('/login')}
        isPending={isPending}
      />
    </div>
  );
}
