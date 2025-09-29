import React, { useState, useMemo } from 'react';
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
import {
  Calendar as CalendarIcon,
  Settings,
  Folder,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type PostMetadata } from '@/types/editor';
import { loadMetadata, saveMetadata } from '@/components/tiptap/persistence';
import { Label } from '@/components/ui/label';
import AuthorSelect from '@/components/Author/AuthorSelect';
import { useUserAuthors } from '@/hooks/useAuthor';
import type { Author } from '@/types/author';

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
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [authorObj, setAuthorObj] = useState<Author | null>(null);

  const { data: authors = [], isLoading } = useUserAuthors() as { data: Author[]; isLoading: boolean };
  const recentAuthors = useMemo(() => {
    return (authors ?? []).slice(-3).reverse();
  }, [authors]);

  const handleSelectAuthor = (id: string | null, a?: Author | null) => {
    setAuthorId(id);
    setAuthorObj(a ?? authors.find((x) => x.id === id) ?? null);
  };

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
                // Big, bold, clean heading
                'w-full h-auto bg-none border-none px-4 py-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug tracking-tight shadow-none',
                // Subtle placeholder + no focus ring/border
                'placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:border-none !outline-none',
                // Use tokens for caret/selection to respect theme
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

              <label className='text-muted-foreground font-medium'>
                Authors
              </label>
              {/* REPLACED: plain Input with quick-picks + dropdown */}
              <div className='flex flex-wrap items-center gap-2'>
                {/* Quick picks: last 3 authors */}
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">Loading authors...</div>
                ) : recentAuthors.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No authors yet.</div>
                ) : (
                  recentAuthors.map((a) => (
                    <Button
                      key={a.id}
                      size="sm"
                      variant={authorId === a.id ? 'default' : 'outline'}
                      onClick={() => handleSelectAuthor(a.id!, a)}
                      className="whitespace-nowrap"
                    >
                      {a.name}
                    </Button>
                  ))
                )}

                {/* Search all authors + create new */}
                <div className="min-w-[220px]">
                  <AuthorSelect
                    value={authorId}
                    onChange={handleSelectAuthor}
                    placeholder="Search author..."
                    allowCreate
                  />
                </div>
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

              <label className='text-muted-foreground font-medium'>
                Category
              </label>
              <div className='relative flex items-center'>
                <Folder className='absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none' />
                <Input
                  className={cn('h-9 w-full pl-10', formFieldClasses)}
                  placeholder='Select a category'
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
      <div className="space-y-4">
        {/* Author field */}
        <div className="space-y-2">
          <Label>Author</Label>

          {/* Quick picks: first 3 recent authors */}
          <div className="flex flex-wrap gap-2">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading authors...
              </div>
            ) : recentAuthors.length === 0 ? (
              <div className="text-sm text-muted-foreground">No authors yet.</div>
            ) : (
              recentAuthors.map((a) => (
                <Button
                  key={a.id}
                  size="sm"
                  variant={authorId === a.id ? 'default' : 'outline'}
                  onClick={() => handleSelectAuthor(a.id!, a)}
                  className="whitespace-nowrap"
                >
                  {a.name}
                </Button>
              ))
            )}

            {/* Search author + create navigation */}
            <div className="min-w-[220px]">
              <AuthorSelect
                value={authorId}
                onChange={handleSelectAuthor}
                placeholder="Search author..."
                allowCreate
              />
            </div>
          </div>

          {authorObj ? (
            <div className="text-xs text-muted-foreground">
              Selected: {authorObj.name}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Pick from quick list or search.
            </div>
          )}
        </div>
      </div>
    </Accordion>
  );
}

export default MetadataForm;
