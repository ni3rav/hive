import { Card } from '@/components/ui/card';
import { PenTool, Type, Users, Code2 } from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: PenTool,
    title: 'Intuitive UI for easy author, category, tags, and post management',
    color: 'text-orange-500',
    span: 'md:col-span-1',
  },
  {
    icon: Type,
    title: 'Smooth writing experience with just the right tools of formatting',
    color: 'text-blue-500',
    span: 'md:col-span-1',
  },
  {
    icon: Users,
    title: 'Seamless workspace-based collaboration',
    color: 'text-purple-500',
    span: 'md:col-span-1',
  },
  {
    icon: Code2,
    title:
      'Straightforward API access that works with any framework: Next, Astro, Express, etc.',
    color: 'text-emerald-500',
    span: 'md:col-span-1',
  },
];

export function FeaturesSection() {
  return (
    <section className='py-16 md:py-24'>
      <div className='container mx-auto px-4 flex flex-col items-center justify-center'>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-4xl md:text-5xl font-bold text-foreground mb-16 text-balance'
        >
          Powerful Features
        </motion.h2>
        <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 w-full max-w-6xl'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={feature.span}
              >
                <Card className='p-7 h-full flex flex-col gap-5 bg-card border-border rounded-lg'>
                  <Icon className={`w-8 h-8 ${feature.color} flex-shrink-0`} />
                  <p className='text-base text-card-foreground font-medium'>
                    {feature.title}
                  </p>
                </Card>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
