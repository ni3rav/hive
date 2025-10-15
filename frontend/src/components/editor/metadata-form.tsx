import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion-animated';
import { Calendar as CalendarIcon, Settings, Tag } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type PostMetadata } from '@/types/editor';
import { loadMetadata, saveMetadata } from '@/components/editor/persistence';
import AuthorSelect from '@/components/Author/AuthorSelect';
import CategorySelect from '@/components/Category/CategorySelect';

interface MetadataFormProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  metadata: PostMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<PostMetadata>>;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MetadataForm({
  isExpanded,
  setIsExpanded,
  metadata,
  setMetadata,
  onTitleChange,
}: MetadataFormProps) {
  const formFieldClasses =
    'bg-transparent border border-border/40 rounded-md transition-all duration-300 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/80 focus-visible:shadow-lg focus-visible:shadow-primary/10';
  const readOnlyClasses = 'bg-muted/50 cursor-not-allowed';

  React.useEffect(() => {
    const persisted = loadMetadata();
    if (persisted) {
      setMetadata(persisted);
    }
  }, [setMetadata]);

  React.useEffect(() => {
    const serializableMetadata = {
      ...metadata,
      publishedAt: metadata.publishedAt
        ? new Date(metadata.publishedAt).toISOString()
        : null,
    };
    saveMetadata(serializableMetadata);
  }, [metadata]);

  return (
    <Accordion
      type='single'
      collapsible
      value={isExpanded ? 'metadata' : ''}
      onValueChange={(value: string) => setIsExpanded(value === 'metadata')}
    >
      <AccordionItem value='metadata'>
        <AccordionTrigger className='hover:no-underline'>
          <div className='flex items-center justify-between w-full pr-4'>
            <div className='flex items-center gap-3 text-sm truncate flex-1 min-w-0'>
              <span
                className='font-semibold truncate max-w-60'
                title={metadata.title}
              >
                {metadata.title || 'Untitled Post'}
              </span>
              <Separator orientation='vertical' className='h-4' />
              <div className='flex items-center gap-4 text-muted-foreground'>
                <span>{format(metadata.publishedAt, 'PPP')}</span>
                <span className='hidden sm:inline-block'>•</span>
                <span className='hidden sm:inline-block'>
                  Category: {metadata.category?.toString() || 'None'}
                </span>
              </div>
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0'>
              <Settings className='h-4 w-4' />
              <span>Details</span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className='p-6 space-y-6'>
            <Input
              type='text'
              placeholder='A Great Title'
              className={cn(
                'w-full h-auto bg-none border-none px-4 py-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug tracking-tight shadow-none',
                'placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:border-none !outline-none',
                'caret-primary selection:bg-primary selection:text-primary-foreground',
              )}
              value={metadata.title}
              onChange={onTitleChange}
            />

            <div className='grid grid-cols-1 md:grid-cols-[120px_1fr] md:items-center gap-x-6 gap-y-6 text-sm'>
              <label className='text-muted-foreground font-medium'>Slug</label>
              <Input
                readOnly
                className={cn('h-9', formFieldClasses, readOnlyClasses)}
                value={metadata.slug}
              />

              {/* Keep only a single Author dropdown (no quick-pick buttons) */}
              <label className='text-muted-foreground font-medium'>
                Author
              </label>
              <div>
                <AuthorSelect
                  value={metadata.authors?.[0] ?? null}
                  onChange={(authorId) => {
                    setMetadata((prev) => ({
                      ...prev,
                      authors: authorId ? [authorId] : [],
                    }));
                  }}
                  placeholder='Select author...'
                  allowCreate
                />
              </div>

              <label className='text-muted-foreground font-medium'>
                Published at
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-[240px] justify-start text-left font-normal h-9 px-3',
                      formFieldClasses,
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {metadata.publishedAt ? (
                      format(metadata.publishedAt, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={metadata.publishedAt}
                    onSelect={(date) =>
                      setMetadata((prev) => ({
                        ...prev,
                        publishedAt: date || new Date(),
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <label className='text-muted-foreground font-medium self-start md:pt-2'>
                Excerpt
              </label>
              <Textarea
                placeholder='A short description of your post. Recommended to be 155 characters or less.'
                className={cn('min-h-[80px]', formFieldClasses)}
                value={metadata.excerpt}
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, excerpt: e.target.value }))
                }
              />

              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Category</label>
                <CategorySelect
                  value={metadata.category?.[0] ?? null}
                  onChange={(categoryId) =>
                    setMetadata((prev) => ({
                      ...prev,
                      category: categoryId ? [categoryId] : [],
                    }))
                  }
                  placeholder='Select category...'
                />
              </div>

              <label className='text-muted-foreground font-medium'>Tags</label>
              <div className='relative flex items-center'>
                <Tag className='absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none' />
                <Input
                  className={cn('h-9 w-full pl-10', formFieldClasses)}
                  placeholder='Select some tags'
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default MetadataForm;
