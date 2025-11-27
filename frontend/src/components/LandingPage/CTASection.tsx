import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export function CTASection() {
  return (
    <section className='py-16 md:py-24'>
      <div className='container mx-auto px-4 flex flex-col items-center justify-center gap-9'>
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-4xl md:text-5xl font-bold text-foreground text-balance text-center'
        >
          Ready to simplify your content workflow?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Link to='/register'>
            <Button size='lg'>Get Started</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
