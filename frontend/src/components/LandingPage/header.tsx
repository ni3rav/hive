import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export function Header() {
  return (
    <header className='sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          <Logo image='/hive.png' />
          <nav className='flex items-center gap-4'>
            <Link to='/login'>
              <Button variant='ghost' size='sm'>
                Login
              </Button>
            </Link>
            <Link to='/register'>
              <Button size='sm'>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
