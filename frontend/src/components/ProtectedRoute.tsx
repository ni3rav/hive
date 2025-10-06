import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
export const ProtectedRoute = () => {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Spinner className='size-5' />
          <span>Checking session…</span>
        </div>
      </div>
    );
  }

  // If a user exists, show the requested page.
  // Otherwise, redirect to the login page.
  return user ? <Outlet /> : <Navigate to='/login' replace />;
};
