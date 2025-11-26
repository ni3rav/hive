import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedGroup } from '@/components/ui/animated-group';

export default function HeroSection() {
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el || el.dataset.processed === 'true') return;
    const rawText = el.textContent || '';
    const words = rawText.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.textContent = w;
      span.className = 'hero-word';
      span.style.setProperty('--wd', `${i * 80}ms`);
      el.appendChild(span);
    });
    el.dataset.processed = 'true';
  }, []);

  return (
    <section
      className='relative flex min-h-screen items-center overflow-hidden pt-32 pb-24'
      style={{
        background:
          'radial-gradient(140% 90% at 15% 10%,rgba(255,255,255,.06) 0%,rgba(255,255,255,0) 65%),radial-gradient(110% 80% at 85% 25%,rgba(255,255,255,.05) 0%,rgba(255,255,255,0) 70%)',
      }}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-[0.22]'
        style={{
          background:
            'repeating-radial-gradient(circle at 0% 0%,rgba(255,255,255,0.05) 0 1px,transparent 1px 120px)',
          mask: 'linear-gradient(to bottom,rgba(0,0,0,1) 0%,rgba(0,0,0,.85) 55%,transparent 95%)',
          WebkitMask:
            'linear-gradient(to bottom,rgba(0,0,0,1) 0%,rgba(0,0,0,.85) 55%,transparent 95%)',
        }}
      />
      <div className='mx-auto flex w-full max-w-6xl px-6 justify-center'>
        <AnimatedGroup
          preset='blur-slide'
          stagger={100}
          className='w-full flex flex-col items-center'
        >
          <div className='ag-item w-full'>
            <div className='container mx-auto flex flex-col items-center'>
              <div className='flex gap-8 py-16 md:py-20 lg:py-28 items-center justify-center flex-col'>
                <div>
                  <Badge variant='secondary'>We&apos;re live!</Badge>
                </div>
                <div className='flex gap-4 flex-col items-center'>
                  <h1
                    ref={headingRef}
                    className='hero-heading justify-center text-4xl md:text-6xl lg:text-7xl max-w-2xl tracking-tighter text-center font-semibold leading-10'
                  >
                    A simple CMS <br />
                    for your next project
                  </h1>
                  <p className='text-base md:text-lg lg:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-xl text-center mt-6'>
                    Write content in one place and fetch it from any frontend
                    with a straightforward API, so your team can focus on what
                    to say instead of how to wire it up
                  </p>
                </div>
                <div className='flex flex-row flex-wrap gap-3 justify-center'>
                  <Button
                    size='lg'
                    className='cursor-pointer'
                    variant='outline'
                    onClick={() => navigate('/workspaces')}
                  >
                    Get Started
                  </Button>
                  <Button
                    size='lg'
                    className='gap-2'
                    onClick={() => navigate('/register')}
                  >
                    Documentation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedGroup>
      </div>
      <noscript>
        <style>{`.hero-heading{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </section>
  );
}
