import { LayoutDashboard, Code2, Users, Edit3 } from 'lucide-react';

export function Features() {
  return (
    <section
      id='features'
      className='relative bg-background min-h-screen flex items-center py-24'
    >
      <div className='mx-auto w-full max-w-6xl px-6'>
        <div className='flex flex-col items-center text-center gap-3'>
          <h2 className='text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase'>
            Features
          </h2>
          <p className='text-base md:text-lg text-muted-foreground'>
            Everything you need to manage your content
          </p>
        </div>

        <div className='mt-10 grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2'>
          {/* Intuitive interface & metadata */}
          <div className='feature-tile-hover rounded-2xl border border-border/70 bg-background/80 px-6 py-6 md:px-8 md:py-8 flex flex-col justify-between h-full transition-all duration-200 hover:shadow-md hover:border-secondary/50 hover:bg-secondary/5'>
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 ring-1 ring-secondary/30'>
                <LayoutDashboard className='h-5 w-5 text-chart-1' />
              </div>
            </div>
            <div className='space-y-2'>
              <h3 className='text-base md:text-lg font-medium tracking-tight'>
                Intuitive User Interface
              </h3>
              <p className='text-sm md:text-[0.95rem] leading-relaxed text-muted-foreground'>
                Manage posts, SEO metadata, and previews in one clean, focused
                interface so content and structure always stay in sync.
              </p>
            </div>
          </div>

          {/* Simple editor */}
          <div className='feature-tile-hover rounded-2xl border border-border/70 bg-background/80 px-6 py-6 md:px-8 md:py-8 flex flex-col justify-between h-full transition-all duration-200 hover:shadow-md hover:border-secondary/50 hover:bg-secondary/5'>
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 ring-1 ring-secondary/30'>
                <Edit3 className='h-5 w-5 text-chart-2' />
              </div>
            </div>
            <div className='space-y-2'>
              <h3 className='text-base md:text-lg font-medium tracking-tight'>
                Simple editor
              </h3>
              <p className='text-sm md:text-[0.95rem] leading-relaxed text-muted-foreground'>
                A distraction-free, smooth writing experience that lets you
                focus on content, not tooling, with sensible formatting built
                in.
              </p>
            </div>
          </div>

          {/* Collaborative workspaces */}
          <div className='feature-tile-hover rounded-2xl border border-border/70 bg-background/80 px-6 py-6 md:px-8 md:py-8 flex flex-col justify-between h-full transition-all duration-200 hover:shadow-md hover:border-secondary/50 hover:bg-secondary/5'>
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 ring-1 ring-secondary/30'>
                <Users className='h-5 w-5 text-chart-3' />
              </div>
            </div>
            <div className='space-y-2'>
              <h3 className='text-base md:text-lg font-medium tracking-tight'>
                Collaborative workspaces
              </h3>
              <p className='text-sm md:text-[0.95rem] leading-relaxed text-muted-foreground'>
                Invite your team into shared workspaces so writers, editors, and
                developers can collaborate on the same content pipeline.
              </p>
            </div>
          </div>

          {/* API access */}
          <div className='feature-tile-hover rounded-2xl border border-border/70 bg-background/80 px-6 py-6 md:px-8 md:py-8 flex flex-col justify-between h-full transition-all duration-200 hover:shadow-md hover:border-secondary/50 hover:bg-secondary/5'>
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 ring-1 ring-secondary/30'>
                <Code2 className='h-5 w-5 text-chart-4' />
              </div>
            </div>
            <div className='space-y-2 max-w-2xl'>
              <h3 className='text-base md:text-lg font-medium tracking-tight'>
                Straightforward API access
              </h3>
              <p className='text-sm md:text-[0.95rem] leading-relaxed text-muted-foreground'>
                Pull content via API into any framework. Works seamlessly with
                Next.js, Astro, Nuxt, and more—without custom plumbing or
                brittle integrations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
