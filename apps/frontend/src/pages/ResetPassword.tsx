import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '@/components/reset-password-form';
import { useResetPassword } from '@/hooks/useAuth';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useHead } from '@unhead/react';
import { createAuthPageSEOMetadata } from '@/lib/seo';

export default function ResetPasswordPage() {
  useHead(createAuthPageSEOMetadata('reset-password'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: resetPassword, isPending } = useResetPassword();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const validatedParams = resetPasswordSchema
    .pick({ email: true, token: true })
    .safeParse({ email, token });
  const isParamsValid = validatedParams.success;

  const handleResetPassword = (
    email: string,
    token: string,
    password: string,
  ) => {
    const validatedData = resetPasswordSchema.safeParse({
      email,
      token,
      password,
    });
    if (!validatedData.success) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    const {
      email: validatedEmail,
      token: validatedToken,
      password: validatedPassword,
    } = validatedData.data;

    resetPassword({
      email: validatedEmail,
      token: validatedToken,
      password: validatedPassword,
    });
  };

  if (!isParamsValid) {
    return (
      <div className='w-screen h-screen grid place-items-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-destructive mb-4'>
            Invalid Reset Link
          </h1>
          <p className='text-muted-foreground mb-4'>
            The reset link is missing required information or is malformed.
          </p>
          <Button
            variant={'ghost'}
            onClick={() => navigate('/forgot-password')}
          >
            Request a new reset link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-screen h-screen grid place-items-center'>
      <ResetPasswordForm
        onFormSubmit={handleResetPassword}
        onBackToLogin={() => navigate('/login')}
        isPending={isPending}
        email={email}
        token={token}
      />
    </div>
  );
}
