import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
      className='relative overflow-hidden pt-40 pb-28'
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
      <div className='mx-auto max-w-6xl px-6'>
        <AnimatedGroup
          preset='blur-slide'
          stagger={100}
          className='flex flex-col gap-8 max-w-3xl'
        >
          <h1
            ref={headingRef}
            className='ag-item hero-heading text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight'
          >
            Build and Ship 10x Faster with Hive
          </h1>
          <p className='ag-item text-lg text-muted-foreground leading-relaxed'>
            Plan, write, optimize and publish with clarity. A focused toolkit
            that removes operational friction from your content workflow.
          </p>
          <div className='ag-item flex flex-wrap items-center gap-6 pt-2'>
            <Button
              size='lg'
              className='rounded-xl px-8 h-14 text-base font-medium bg-primary text-primary-foreground hover:brightness-95'
              onClick={() => navigate('/login')}
            >
              Start Building
            </Button>
            <button
              onClick={() => navigate('/login')}
              // Change: Using secondary color on hover
              className='text-sm font-medium tracking-wide text-muted-foreground hover:text-secondary transition'
            >
              Request a demo
            </button>
          </div>
        </AnimatedGroup>
      </div>
      <noscript>
        <style>{`.hero-heading{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </section>
  );
}
