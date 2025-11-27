import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { env } from '@/lib/env';

export function HeroSection() {
  return (
    <section className='min-h-dvh flex items-center justify-center'>
      <div className='container mx-auto px-4 flex flex-col items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center'
        >
          <h1 className='text-5xl md:text-6xl font-bold text-foreground mb-7 text-balance'>
            A simple CMS
            <br />
            for your next project
          </h1>
          <p className='text-lg md:text-xl text-muted-foreground mb-9 max-w-2xl mx-auto text-balance'>
            Write content in one place and fetch it from any frontend with a
            straightforward API, so your team can focus on what to say instead
            of how to wire it up.
          </p>
          <div className='flex flex-col sm:flex-row gap-5 justify-center'>
            <Link to='/workspaces'>
              <Button size='lg'>Get Started</Button>
            </Link>
            <a href={env.VITE_DOCS_URL} target='_blank' rel='noopener noreferrer'>
              <Button size='lg' variant='outline'>
                Docs
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
