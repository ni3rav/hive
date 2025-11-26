import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInviteDetails, useAcceptInvite } from '@/hooks/useMember';
import { getErrorMessage } from '@/lib/error-utils';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useHead(
    createSEOMetadata({
      title: 'Accept Invitation',
      description: 'Accept workspace invitation',
      noindex: true,
    }),
  );

  // Use mock hooks or replace with real hooks from useMember.ts
  const {
    data: inviteDetails,
    isLoading: isFetchingDetails,
    isError: isFetchError,
    error: fetchError,
  } = useInviteDetails(token || undefined);

  const {
    mutate: acceptInvitation,
    isPending: isAccepting,
    error: acceptError,
  } = useAcceptInvite();

  const handleAcceptInvite = () => {
    if (!token || !inviteDetails) return;

    acceptInvitation(token, {
      onSuccess: (data) => {
        navigate(`/dashboard/${data.workspaceSlug}`);
      },
    });
  };

  const handleDeclineInvite = () => {
    // Redirect to a safe, authenticated route (e.g., workspaces list)
    navigate('/workspaces');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // 1. Check for missing token
  if (!token) {
    return (
      // Applied robust centering wrapper
      <div className='w-screen h-screen grid place-items-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-destructive' />
              Invalid Link
            </CardTitle>
            <CardDescription>
              The invitation link is malformed or missing the required token.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleGoBack} className='w-full'>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 2. Loading state
  if (isFetchingDetails) {
    return (
      // Applied robust centering wrapper
      <div className='w-screen h-screen grid place-items-center p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
            <p className='text-sm text-muted-foreground'>
              Verifying invitation details...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Error state (Invalid/Expired token)
  if (isFetchError || !inviteDetails) {
    const errorMsg = getErrorMessage(
      fetchError,
      'This invitation is invalid, expired, or has already been accepted.',
    );
    return (
      // Applied robust centering wrapper
      <div className='w-screen h-screen grid place-items-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-destructive flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-destructive' />
              Invitation Failed
            </CardTitle>
            <CardDescription>
              We could not verify the invitation details.
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-2'>
            <Alert variant='destructive'>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGoBack} className='w-full'>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 4. Ready to accept/decline
  return (
    // Applied robust centering wrapper
    <div className='w-screen h-screen grid place-items-center p-4'>
      <Card className='w-full max-w-md'>
        {/* FIX APPLIED: Set CardHeader to relative and put button as absolute */}
        <CardHeader className='relative'>
          <Button
            variant='ghost'
            onClick={handleDeclineInvite}
            // Use absolute top-4 left-4 to float the button out of the content flow
            className='absolute top-4 left-4 w-fit'
            disabled={isAccepting}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>

          <div className='flex flex-col items-center text-center'>
            <div className='flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4'>
              <Mail className='h-8 w-8 text-primary' />
            </div>
            <CardTitle className='text-2xl'>Workspace Invitation</CardTitle>
            <CardDescription>
              You've been invited to join the workspace below.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-3'>
          <>
            <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
              <Users className='h-5 w-5 text-muted-foreground mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>Workspace</p>
                <p className='text-sm text-muted-foreground'>
                  {inviteDetails.workspaceName}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
              <Mail className='h-5 w-5 text-muted-foreground mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>Invited by</p>
                <p className='text-sm text-muted-foreground'>
                  {inviteDetails.inviterName || inviteDetails.inviterEmail}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
              <CheckCircle2 className='h-5 w-5 text-muted-foreground mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>Role</p>
                <p className='text-sm text-muted-foreground capitalize'>
                  {inviteDetails.role}
                </p>
              </div>
            </div>
          </>

          {acceptError && (
            <Alert variant='destructive'>
              <AlertDescription>
                {getErrorMessage(acceptError, 'Failed to accept invitation')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className='flex flex-col gap-4'>
          <div className='flex gap-3 w-full'>
            <Button
              variant='outline'
              className='flex-1'
              onClick={handleDeclineInvite}
              disabled={isAccepting}
            >
              Decline
            </Button>
            <Button
              className='flex-1'
              onClick={handleAcceptInvite}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          </div>
          <p className='text-xs text-center text-muted-foreground'>
            By accepting this invitation, you agree to the workspace's terms and
            conditions.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
