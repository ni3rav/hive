import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const { data: user, isLoading } = useAuth();

  return (
    <header className='sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          <Logo image='/hive.png' />
          <nav className='flex items-center gap-4'>
            {isLoading ? (
              <Skeleton className='h-8 w-24' />
            ) : user ? (
              <Link to='/workspaces'>
                <Button size='sm'>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to='/login'>
                  <Button variant='ghost' size='sm'>
                    Login
                  </Button>
                </Link>
                <Link to='/register'>
                  <Button size='sm'>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
