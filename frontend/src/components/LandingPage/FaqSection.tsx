import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'motion/react';

const faqs = [
  {
    question: 'What is Hive?',
    answer:
      'Hive is a simple, straightforward CMS designed for teams and creators who want to manage content in one place and fetch it from any frontend using a clean API.',
  },
  {
    question: 'Which frameworks does Hive support?',
    answer:
      'Hive works with any framework that can make HTTP requests. This includes Next.js, Astro, Express, React, Vue, and many others.',
  },
  {
    question: 'How does the API work?',
    answer:
      'Hive provides a straightforward REST API that allows you to fetch content programmatically. Simply generate API keys for your workspace and start fetching posts, categories, and tags.',
  },
  {
    question: 'Can multiple users collaborate?',
    answer:
      'Yes! Hive supports workspace-based collaboration, allowing multiple team members to work together on content creation and management seamlessly.',
  },
];

export function FAQSection() {
  return (
    <section className='min-h-dvh flex items-center justify-center py-16'>
      <div className='container mx-auto px-4 flex flex-col items-center justify-center gap-9 max-w-2xl w-full'>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-4xl md:text-5xl font-bold text-foreground text-balance text-center'
        >
          Frequently Asked Questions
        </motion.h2>
        <Accordion type='single' collapsible className='w-full'>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger className='text-foreground text-lg font-semibold'>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className='text-muted-foreground'>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
