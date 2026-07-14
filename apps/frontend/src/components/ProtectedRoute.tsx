import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
export const ProtectedRoute = () => {
  const { data: user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Spinner className='size-5' />
        </div>
      </div>
    );
  }

  return user ? (
    <Outlet />
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  );
};
