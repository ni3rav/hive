import { env } from '@/lib/env';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className='border-t border-primary/10 border-dashed bg-background/50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='flex flex-col gap-2 text-center md:text-left'>
            <p className='text-sm text-muted-foreground'>
              Made by{' '}
              <Link
                to='https://github.com/ni3rav'
                className='text-primary hover:underline'
                target='_blank'
                rel='noopener noreferrer'
              >
                Nirav
              </Link>{' '}
              and{' '}
              <Link
                to='https://github.com/supalvasani'
                className='text-primary hover:underline'
                target='_blank'
                rel='noopener noreferrer'
              >
                Supal
              </Link>
            </p>
            <p className='text-sm text-muted-foreground'>
              Licensed under <span className='font-semibold'>MIT</span>
            </p>
          </div>
          <div className='flex gap-6'>
            <Link
              to='https://github.com/ni3rav/hive'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors'
              target='_blank'
              rel='noopener noreferrer'
            >
              GitHub
            </Link>
            <a
              href={env.VITE_DOCS_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors'
            >
              Docs
            </a>
            <a
              href='mailto:niravv1405@gmail.com'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors'
              target='_blank'
              rel='noopener noreferrer'
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
