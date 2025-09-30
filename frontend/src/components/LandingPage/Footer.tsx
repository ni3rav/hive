import { Hexagon } from 'lucide-react';

const col1 = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];
const col2 = [
  { label: 'Docs', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Support', href: '#' },
];

export default function Footer() {
  return (
    <footer className='border-t border-border/40 bg-background/70 backdrop-blur'>
      <div className='mx-auto max-w-6xl px-6 py-14'>
        <div className='grid gap-12 md:grid-cols-4'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Hexagon className='size-8 text-primary fill-background flex items-center justify-center' />
              <span className='font-semibold tracking-tight'>Hive</span>
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed max-w-xs'>
              Plan, write, optimize and ship consistent content with less
              friction.
            </p>
          </div>
          <div className='text-xs space-y-2'>
            <h4 className='font-medium text-muted-foreground/80'>Product</h4>
            <ul className='space-y-1'>
              {col1.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className='text-muted-foreground hover:text-foreground transition'
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className='text-xs space-y-2'>
            <h4 className='font-medium text-muted-foreground/80'>Resources</h4>
            <ul className='space-y-1'>
              {col2.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className='text-muted-foreground hover:text-foreground transition'
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className='text-xs space-y-2'>
            <h4 className='font-medium text-muted-foreground/80'>
              Stay Updated
            </h4>
            <p className='text-muted-foreground'>
              Updates & best practices soon.
            </p>
          </div>
        </div>
        <div className='mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between'>
          <span className='text-[11px] text-muted-foreground'>
            © {new Date().getFullYear()} Hive. All rights reserved.
          </span>
          <div className='flex gap-5 text-[11px] text-muted-foreground'>
            <a href='#' className='hover:text-foreground transition'>
              Privacy
            </a>
            <a href='#' className='hover:text-foreground transition'>
              Terms
            </a>
            <a href='#' className='hover:text-foreground transition'>
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
