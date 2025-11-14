import { useEffect, useState } from 'react';
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
import { ArrowLeft, CheckCircle2, Loader2, Mail, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
// NOTE: These are placeholder imports for the logic implemented below.
// In a production environment, you would import actual hooks from '@/hooks/useMember'.
// import { useInviteDetails, useAcceptInvite } from '@/hooks/useMember';


// --- START MOCK API & HOOK LOGIC (Placeholder for real backend integration) ---
type InviteDetails = {
  workspaceName: string;
  inviterEmail: string;
  role: string;
  workspaceSlug: string;
};

// Simulate fetching invite details (e.g., useQuery)
function useInviteDetails(
  token: string | undefined,
): {
  data: InviteDetails | null;
  isLoading: boolean;
  isError: boolean;
  error: { message: string } | null;
} {
  const [data, setData] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setIsError(true);
      setError({ message: 'Invalid or missing invitation token' });
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);
    setData(null);

    // MOCK API CALL
    const timer = setTimeout(() => {
      if (token === 'valid-token') {
        setData({
          workspaceName: 'Demo Workspace',
          inviterEmail: 'admin@example.com',
          role: 'member',
          workspaceSlug: 'demo-workspace',
        });
        setError(null);
      } else {
        setIsError(true);
        setError({ message: 'This invitation is invalid, expired, or has already been accepted.' });
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [token]);

  return { data, isLoading, isError, error };
}

// Simulate accepting the invite (e.g., useMutation)
function useAcceptInvite() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  const mutate = (token: string, options: { onSuccess: (data: { workspaceSlug: string }) => void }) => {
    setIsPending(true);
    setError(null);

    // MOCK API CALL
    const timer = setTimeout(() => {
      if (token === 'valid-token') {
        setError(null);
        options.onSuccess({ workspaceSlug: 'demo-workspace' });
      } else {
        setError({ message: 'Failed to accept invitation. Please try again.' });
      }
      setIsPending(false);
    }, 1500);

    return () => clearTimeout(timer);
  };

  return { mutate, isPending, error };
}
// --- END MOCK API & HOOK LOGIC ---


export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
    const errorMsg = fetchError?.message || 'This invitation is invalid, expired, or has already been accepted.';
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
            <Button onClick={handleGoBack } className='w-full'>
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
            <CardTitle className='text-2xl'> 
              Workspace Invitation
            </CardTitle>
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
                  {inviteDetails.inviterEmail}
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
              <AlertDescription>{acceptError.message}</AlertDescription>
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