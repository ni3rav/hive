import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useVerifyEmail } from '@/hooks/useAuth';
import { verifyEmailSchema } from '@/lib/validations/auth';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  const isVerificationMode = !!(token && userId);

  const validatedData = isVerificationMode
    ? verifyEmailSchema.safeParse({ token, userId })
    : { success: true, data: null };

  const isParamsValid = isVerificationMode ? validatedData.success : true;

  useHead(
    createSEOMetadata({
      title: 'Verify Email',
      description: 'Verify your email address to activate your account',
      noindex: true,
    }),
  );

  const {
    mutate: verifyEmail,
    isError,
    isSuccess,
    isPending,
  } = useVerifyEmail({ token: token ?? '', userId: userId ?? '' });

  useEffect(() => {
    if (isVerificationMode) {
      if (!isParamsValid) {
        const fieldErrors =
          !validatedData.success && 'error' in validatedData
            ? validatedData.error.format()
            : null;
        const errorMessage =
          (fieldErrors &&
            (fieldErrors.token?._errors[0] ||
              fieldErrors.userId?._errors[0])) ||
          'Invalid verification link';
        toast.error(errorMessage);
        return;
      }
      verifyEmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerificationMode, isParamsValid, verifyEmail]);

  if (!isVerificationMode) {
    return (
      <div className='w-full min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='flex items-center justify-center mb-8'>
            <img src='/hive.png' alt='Hive Logo' className='h-10 w-10' />
            <span className='text-2xl font-bold text-white ml-2'>Hive</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='text-xl font-semibold'>
                Verify Your Email
              </CardTitle>
              <CardDescription>
                Check your inbox to verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center py-6 text-center'>
              <div className='rounded-full bg-primary/10 p-4 mb-4'>
                <Mail className='h-12 w-12 text-primary' />
              </div>
              {email ? (
                <p className='text-muted-foreground'>
                  We&apos;ve sent a verification link to <br />
                  <strong className='text-foreground'>{email}</strong>
                </p>
              ) : (
                <p className='text-muted-foreground'>
                  Please check your email for the verification link.
                </p>
              )}
            </CardContent>
            <CardFooter className='flex flex-col gap-2'>
              <Button
                onClick={() => navigate('/login')}
                variant='outline'
                className='w-full'
              >
                Need a new link? Log in again
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant='ghost'
                className='w-full'
              >
                Return to Home Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='flex items-center justify-center mb-8'>
          <img src='/hive.png' alt='Hive Logo' className='h-10 w-10' />
          <span className='text-2xl font-bold text-white ml-2'>Hive</span>
        </div>

        <Card>
          <CardHeader>
            {!isParamsValid ? (
              <>
                <CardTitle className='text-xl font-semibold'>
                  Invalid verification link
                </CardTitle>
                <CardDescription>
                  The link is missing required information or is malformed.
                </CardDescription>
              </>
            ) : isPending ? (
              <>
                <CardTitle className='text-xl font-semibold'>
                  <Skeleton className='h-6 w-48' />
                </CardTitle>
                <CardDescription>
                  <Skeleton className='h-4 w-64' />
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className='text-xl font-semibold'>
                  {isSuccess && 'Email Verified'}
                  {isError && 'Verification Failed'}
                </CardTitle>
                <CardDescription>
                  {isSuccess &&
                    'Your email has been successfully verified and your account is now active.'}
                  {isError && "We couldn't verify your email."}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className='flex flex-col items-center justify-center py-6'>
            {!isParamsValid && (
              <AlertCircle className='h-16 w-16 text-destructive' />
            )}
            {isParamsValid && isPending && (
              <Spinner className='h-16 w-16 text-primary' />
            )}
            {isParamsValid && isSuccess && (
              <CheckCircle className='h-16 w-16 text-primary' />
            )}
            {isParamsValid && isError && (
              <div className='flex flex-col items-center text-center'>
                <AlertCircle className='h-16 w-16 text-destructive mb-4' />
                <p className='text-muted-foreground'>
                  The verification link may be invalid or expired.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className='flex justify-center'>
            {!isParamsValid && (
              <Button onClick={() => navigate('/')} variant='outline'>
                Return to Home Page
              </Button>
            )}
            {isParamsValid && isSuccess && (
              <Button
                onClick={() => navigate('/workspaces')}
                className='bg-primary text-primary-foreground hover:bg-primary/90 font-medium'
              >
                Go to Workspaces
              </Button>
            )}
            {isParamsValid && isError && (
              <Button onClick={() => navigate('/')} variant='outline'>
                Return to Home Page
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default VerifyPage;
