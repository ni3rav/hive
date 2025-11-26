import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '../ui/skeleton';

const nav: { label: string; href: string }[] = [
  { label: 'Features', href: '#features' },
  { label: 'Solution', href: '#solution' },
  { label: 'Docs', href: '/docs' },
];

export function HeroHeader() {
  const [scrollY, setScrollY] = React.useState(0);
  const navigate = useNavigate();
  const { data: user, isLoading } = useAuth(); // Get user auth state

  React.useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Calculate scroll progress (0 to 1)
  const scrollProgress = Math.min(scrollY / 100, 1); // Start animating after 100px scroll
  const scrolled = scrollY > 20;

  return (
    <header className='fixed inset-x-0 top-0 z-50'>
      <motion.div
        className={`mx-auto px-6 transition-all duration-300 ${
          scrolled
            ? 'mt-4 rounded-full bg-background/70 backdrop-blur-lg shadow-lg shadow-black/30'
            : 'bg-transparent'
        }`}
        style={{
          maxWidth: `calc(72rem - ${scrollProgress * 20}rem)`, // Gradually reduce from 72rem to 52rem
        }}
      >
        <div
          className={`flex items-center justify-between gap-8 transition-[height] duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          <div className='flex items-center gap-10'>
            <a href='/' className='flex shrink-0 items-center gap-2'>
              <Logo />
            </a>
            <nav className='hidden md:flex items-center gap-7 text-sm'>
              {nav.map((i) => (
                <a
                  key={i.label}
                  href={i.href}
                  // className='inline-flex h-8 items-center text-muted-foreground transition hover:text-foreground'
                  className='hidden h-8 items-center text-muted-foreground transition hover:text-foreground' //hidden for now
                >
                  {i.label}
                </a>
              ))}
            </nav>
          </div>
          <div className='flex items-center gap-3'>
            {isLoading ? (
              <Skeleton className='w-24 h-8 rounded-md' />
            ) : user ? (
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
      </motion.div>
    </header>
  );
}
