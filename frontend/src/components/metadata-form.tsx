import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Calendar as CalendarIcon, Settings } from 'lucide-react';
import React, { useEffect, useMemo, useCallback } from 'react';
import { cn, getCookie, setCookie } from '@/lib/utils';
import { format } from 'date-fns';
import { type PostMetadata } from '@/types/editor';
import AuthorSelect from '@/components/Author/AuthorSelect';
import CategorySelect from '@/components/Category/CategorySelect';
import TagMultiSelect from '@/components/Tag/TagMultiSelect';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  postMetadataSchema,
  type PostMetadataFormData,
} from '@/lib/validations/post';

const METADATA_EXPANDED_COOKIE = 'metadataExpanded';

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

  const defaultValues = useMemo<PostMetadataFormData>(
    () => ({
      title: metadata.title || '',
      slug: metadata.slug || '',
      excerpt: metadata.excerpt || '',
      authorId: metadata.authorId,
      categorySlug: metadata.categorySlug,
      tagSlugs: metadata.tagSlugs || [],
      publishedAt: metadata.publishedAt || new Date(),
      visible: metadata.visible ?? true,
      status: metadata.status || 'draft',
    }),
    [metadata],
  );

  const form = useForm<PostMetadataFormData>({
    resolver: zodResolver(postMetadataSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const { register, control, watch, setValue, reset, getValues } = form;

  const titleValue = watch('title');
  const slugValue = watch('slug');
  const publishedAtValue = watch('publishedAt');
  const categorySlugValue = watch('categorySlug');
  const statusValue = watch('status');

  const syncToParent = useCallback(() => {
    const values = getValues();
    setMetadata({
      title: values.title || '',
      slug: values.slug || '',
      excerpt: values.excerpt || '',
      authorId: values.authorId,
      categorySlug: values.categorySlug,
      tagSlugs: values.tagSlugs || [],
      publishedAt: values.publishedAt || new Date(),
      visible: values.visible ?? true,
      status: values.status || 'draft',
    });
  }, [getValues, setMetadata]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (titleValue) {
      const autoSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();
      if (autoSlug && autoSlug !== slugValue) {
        setValue('slug', autoSlug, { shouldValidate: true });
      }
    }
  }, [titleValue, slugValue, setValue]);

  useEffect(() => {
    const savedExpanded = getCookie(METADATA_EXPANDED_COOKIE);
    if (savedExpanded !== undefined) {
      setIsExpanded(savedExpanded === 'true');
    }
  }, [setIsExpanded]);

  useEffect(() => {
    setCookie(METADATA_EXPANDED_COOKIE, String(isExpanded), {
      maxAgeSeconds: 365 * 24 * 60 * 60,
    });
  }, [isExpanded]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('title', value, { shouldValidate: true });
    onTitleChange(e);
  };

  const handleBlur = () => {
    syncToParent();
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
                title={titleValue || 'Untitled Post'}
              >
                {titleValue || 'Untitled Post'}
              </span>
              <Separator orientation='vertical' className='h-4' />
              <div className='flex items-center gap-4 text-muted-foreground'>
                <span>{format(publishedAtValue || new Date(), 'PPP')}</span>
                <span className='hidden sm:inline-block'>•</span>
                <span className='hidden sm:inline-block'>
                  Category: {categorySlugValue || 'None'}
                </span>
                <span className='hidden sm:inline-block'>•</span>
                <span className='hidden sm:inline-block capitalize'>
                  {statusValue || 'draft'}
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
              {...register('title', {
                onChange: handleTitleChange,
                onBlur: handleBlur,
              })}
            />

            <div className='grid grid-cols-1 md:grid-cols-[120px_1fr] md:items-center gap-x-6 gap-y-6 text-sm'>
              <label className='text-muted-foreground font-medium'>Slug</label>
              <Input
                readOnly
                className={cn('h-9', formFieldClasses, readOnlyClasses)}
                {...register('slug', { onBlur: handleBlur })}
              />

              <label className='text-muted-foreground font-medium'>
                Author
              </label>
              <Controller
                control={control}
                name='authorId'
                render={({ field }) => (
                  <AuthorSelect
                    value={field.value ?? null}
                    onChange={(authorId) => {
                      field.onChange(authorId || undefined);
                      syncToParent();
                    }}
                    placeholder='Select author...'
                    allowCreate
                  />
                )}
              />

              <label className='text-muted-foreground font-medium'>
                Published at
              </label>
              <Controller
                control={control}
                name='publishedAt'
                render={({ field }) => (
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
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date || new Date());
                          syncToParent();
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />

              <label className='text-muted-foreground font-medium self-start md:pt-2'>
                Excerpt
              </label>
              <Textarea
                placeholder='A short description of your post. Recommended to be 155 characters or less.'
                className={cn('min-h-[80px]', formFieldClasses)}
                {...register('excerpt', { onBlur: handleBlur })}
              />

              <label className='text-muted-foreground font-medium'>
                Category
              </label>
              <Controller
                control={control}
                name='categorySlug'
                render={({ field }) => (
                  <CategorySelect
                    value={field.value ?? null}
                    onChange={(categorySlug) => {
                      field.onChange(categorySlug || undefined);
                      syncToParent();
                    }}
                    placeholder='Select category...'
                    allowCreate
                  />
                )}
              />

              <label className='text-muted-foreground font-medium'>Tags</label>
              <Controller
                control={control}
                name='tagSlugs'
                render={({ field }) => (
                  <TagMultiSelect
                    value={field.value || []}
                    onChange={(tagSlugs) => {
                      field.onChange(tagSlugs);
                      syncToParent();
                    }}
                    placeholder='Select tags...'
                    allowCreate
                  />
                )}
              />

              <label className='text-muted-foreground font-medium'>
                Status
              </label>
              <Controller
                control={control}
                name='status'
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value as 'draft' | 'published');
                      syncToParent();
                    }}
                  >
                    <SelectTrigger className={cn('h-9', formFieldClasses)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='draft'>Draft</SelectItem>
                      <SelectItem value='published'>Published</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <label className='text-muted-foreground font-medium'>
                Visibility
              </label>
              <Controller
                control={control}
                name='visible'
                render={({ field }) => (
                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        syncToParent();
                      }}
                    />
                    <span className='text-sm text-muted-foreground'>
                      {field.value ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default MetadataForm;
