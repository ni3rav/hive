import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export function UsedBySection() {
  return (
    <section className='py-16 md:py-24'>
      <div className='container mx-auto px-4 flex flex-col items-center justify-center gap-16'>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-4xl md:text-5xl font-bold text-foreground text-balance text-center'
        >
          Used by teams and creators
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='w-full max-w-4xl h-72 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30'
        >
          <p className='text-muted-foreground'>Logo grid coming soon</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <a href='mailto:niravv1405@gmail.com?subject=Using%20Hive'>
            <Button size='lg'>Are you using Hive?</Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
