import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/useAuth';

const nav = [
  { label: 'Features', href: '#features' },
  { label: 'Solution', href: '#solution' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

export function HeroHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const navigate = useNavigate();
  const { data: user, isLoading } = useAuth(); // Get user auth state

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className='fixed inset-x-0 top-0 z-50'>
      <div
        className={`mx-auto px-6 transition-all duration-300 ${
          scrolled
            ? 'mt-4 max-w-max rounded-full bg-background/70 backdrop-blur-lg shadow-lg shadow-black/30'
            : 'max-w-6xl bg-transparent'
        }`}
      >
        <div
          className={`flex items-center justify-between gap-8 transition-[height] duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          <div className='flex items-center gap-10'>
            <a href='/' className='flex shrink-0 items-center gap-2'>
              <Logo />
              <span className='font-semibold tracking-tight'>Hive</span>
            </a>
            <nav className='hidden md:flex gap-7 text-sm'>
              {nav.map((i) => (
                <a
                  key={i.label}
                  href={i.href}
                  className='text-muted-foreground transition hover:text-foreground'
                >
                  {i.label}
                </a>
              ))}
            </nav>
          </div>
          <div className='flex items-center gap-3'>
            {isLoading ? null : user ? (
              // If user is logged in, show Dashboard button
              <Button
                size='sm'
                className='bg-primary text-primary-foreground hover:bg-primary/90'
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
            ) : (
              // If user is not logged in, show Login and Sign Up buttons
              <>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-border/50 hover:bg-primary/10'
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  size='sm'
                  className='bg-primary text-primary-foreground hover:bg-primary/90'
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
