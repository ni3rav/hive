import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function NotFound({ className }: { className?: string }) {
  useHead(
    createSEOMetadata({
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist',
      noindex: true,
    }),
  );
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-4 p-8 text-center',
        className,
      )}
    >
      <h1 className='text-3xl font-bold tracking-tight'>Page not found</h1>
      <p className='text-muted-foreground'>
        The page you are looking for doesn&apos;t exist or was moved.
      </p>
      <div className='flex items-center gap-2'>
        <Button asChild>
          <Link to='/'>Go to Home</Link>
        </Button>
        <Button variant='secondary' asChild>
          <Link to='/dashboard'>Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
