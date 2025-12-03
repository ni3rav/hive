import React, { useCallback, useEffect, useMemo } from 'react';
import { useEditorContext } from '@/components/editor/editor-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import { Calendar as CalendarIcon, Loader2, Info } from 'lucide-react';
import AuthorSelect from '@/components/Author/AuthorSelect';
import TagMultiSelect from '@/components/Tag/TagMultiSelect';
import CategorySelect from '@/components/Category/CategorySelect';
import { useCreatePost, useUpdatePost } from '@/hooks/usePost';
import type { CreatePostData, UpdatePostData } from '@/types/post';
import {
  getContentFromEditor,
  isEditorEmpty as checkEditorEmpty,
} from '@/components/editor/content-utils';
import { clearWorkspacePersistence } from '@/components/editor/persistence';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useQueryParam } from '@/lib/query-params';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  postMetadataSchema,
  type PostMetadataFormData,
} from '@/lib/validations/post';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Sparkles } from 'lucide-react';

export function EditorSidebar() {
  const {
    metadata,
    setMetadata,
    editorRef,
    workspaceSlug,
    isEditing,
    postSlug,
    originalContent,
  } = useEditorContext();

  const createPostMutation = useCreatePost(workspaceSlug);
  const updatePostMutation = useUpdatePost(workspaceSlug, postSlug || '');
  const navigate = useNavigate();

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

  const {
    register,
    control,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isValid },
  } = form;

  const titleValue = watch('title');
  const slugValue = watch('slug');
  const allValues = watch();
  const slugManuallyEditedRef = React.useRef(false);
  const isSyncingRef = React.useRef(false);

  const [hasContentChanged, setHasContentChanged] = React.useState(false);
  const initialContentRef = React.useRef<string | null>(null);
  const editor = editorRef.current?.editor;

  const syncToParent = useCallback(() => {
    isSyncingRef.current = true;
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
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [getValues, setMetadata]);

  useEffect(() => {
    if (isSyncingRef.current) return;
    reset(defaultValues);
    slugManuallyEditedRef.current = false;
  }, [defaultValues, reset]);

  const metadataChanged = useMemo(() => {
    const defaults = form.formState.defaultValues || defaultValues;

    return (Object.keys(allValues) as Array<keyof PostMetadataFormData>).some(
      (key) => {
        const v1 = allValues[key];
        const v2 = defaults[key];

        if (v1 === v2) return false;

        // Handle undefined/null
        if (
          (v1 === undefined || v1 === null) &&
          (v2 === undefined || v2 === null)
        )
          return false;

        // String comparison with trim
        if (typeof v1 === 'string' && typeof v2 === 'string') {
          return v1.trim() !== v2.trim();
        }

        // Date comparison
        if (v1 instanceof Date && v2 instanceof Date) {
          return v1.getTime() !== v2.getTime();
        }

        // Array comparison (for tags)
        if (Array.isArray(v1) && Array.isArray(v2)) {
          if (v1.length !== v2.length) return true;
          return JSON.stringify(v1) !== JSON.stringify(v2);
        }

        return v1 !== v2;
      },
    );
  }, [allValues, form.formState.defaultValues, defaultValues]);

  // Auto-generate slug from title when creating and slug not manually edited
  useEffect(() => {
    if (isEditing || !titleValue || slugValue || slugManuallyEditedRef.current)
      return;

    const autoSlug = titleValue
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();

    if (autoSlug) {
      setValue('slug', autoSlug, { shouldValidate: true });
    }
  }, [titleValue, slugValue, setValue, isEditing]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const sanitizeSnapshot = (raw: string | null) => {
      if (!raw) return null;
      try {
        return JSON.stringify(JSON.parse(raw));
      } catch (error) {
        console.error('Failed to parse original editor content', error);
        return raw;
      }
    };

    initialContentRef.current = sanitizeSnapshot(originalContent);

    let hasCapturedBaseline = false;

    if (initialContentRef.current === null) {
      initialContentRef.current = JSON.stringify(editor.getJSON());
      hasCapturedBaseline = true;
    }

    setHasContentChanged(false);

    const handleUpdate = () => {
      const snapshot = JSON.stringify(editor.getJSON());

      if (!hasCapturedBaseline) {
        if (
          initialContentRef.current === null ||
          snapshot !== initialContentRef.current
        ) {
          initialContentRef.current = snapshot;
        }
        hasCapturedBaseline = true;
        setHasContentChanged(false);
        return;
      }

      setHasContentChanged(snapshot !== initialContentRef.current);
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, originalContent, isEditing]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue('title', value, { shouldValidate: true });
  };

  const handleBlur = () => {
    syncToParent();
  };

  const handleSave = async () => {
    const isValidForm = await form.trigger();
    if (!isValidForm) {
      toast.error('Please fix the form errors before saving');
      return;
    }

    const editor = editorRef.current?.editor;
    if (!editor) {
      toast.error('Editor is not ready');
      return;
    }

    if (!metadata.title) {
      toast.error('Title is required');
      return;
    }

    if (!metadata.slug) {
      toast.error('Slug is required');
      return;
    }

    if (checkEditorEmpty(editor)) {
      toast.error('Post content cannot be empty');
      return;
    }

    const formValues = getValues();

    const { contentHtml, contentJson } = getContentFromEditor(editor);

    const baseData: Omit<UpdatePostData, 'slug' | 'publishedAt'> = {
      title: formValues.title,
      excerpt: formValues.excerpt || '',
      authorId: formValues.authorId,
      categorySlug: formValues.categorySlug,
      tagSlugs: formValues.tagSlugs || [],
      status: formValues.status,
      visible: formValues.visible,
      contentHtml,
      contentJson,
    };

    if (isEditing && postSlug) {
      const updateData: UpdatePostData = {
        ...baseData,
        slug: formValues.slug,
        publishedAt: formValues.publishedAt || new Date(),
      };

      updatePostMutation.mutate(updateData, {
        onSuccess: () => {
          const editorInstance = editorRef.current?.editor;
          if (editorInstance) {
            editorInstance.commands.setContent('<p></p>');
          }

          clearWorkspacePersistence(workspaceSlug);
          clearWorkspacePersistence(undefined);

          navigate(`/dashboard/${workspaceSlug}/posts`);
        },
      });
    } else {
      const postData = {
        ...baseData,
        slug: formValues.slug,
        publishedAt: formValues.publishedAt || new Date(),
      } as CreatePostData & { slug: string; publishedAt: Date };

      createPostMutation.mutate(postData, {
        onSuccess: () => {
          const editorInstance = editorRef.current?.editor;
          if (editorInstance) {
            editorInstance.commands.setContent('<p></p>');
          }

          clearWorkspacePersistence(workspaceSlug);
          clearWorkspacePersistence(undefined);

          setMetadata((prev) => ({
            ...prev,
            title: '',
            slug: '',
            excerpt: '',
            authorId: undefined,
            categorySlug: undefined,
            tagSlugs: [],
            publishedAt: new Date(),
            visible: true,
            status: 'draft',
          }));
        },
      });
    }
  };

  const handleClear = () => {
    const editor = editorRef.current?.editor;
    if (editor) {
      editor.commands.setContent('<p></p>');
    }

    const initialValues: PostMetadataFormData = {
      title: '',
      slug: '',
      excerpt: '',
      authorId: undefined,
      categorySlug: undefined,
      tagSlugs: [],
      publishedAt: new Date(),
      visible: true,
      status: 'draft',
    };

    reset(initialValues);

    setMetadata({
      title: '',
      slug: '',
      excerpt: '',
      authorId: undefined,
      categorySlug: undefined,
      tagSlugs: [],
      publishedAt: new Date(),
      visible: true,
      status: 'draft',
    });

    clearWorkspacePersistence(workspaceSlug);
    clearWorkspacePersistence(undefined);
  };

  const editorIsEmpty = editor ? checkEditorEmpty(editor) : true;

  const isSaving = isEditing
    ? updatePostMutation.isPending
    : createPostMutation.isPending;

  const hasChanges = metadataChanged || hasContentChanged;

  const isSaveDisabled =
    !isValid || isSaving || !editor || editorIsEmpty || !hasChanges;

  const [activeTab, setActiveTab] = useQueryParam('tab', 'metadata');
  const [editorText, setEditorText] = React.useState('');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Update analysis when editor content changes
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setEditorText(editor.getText());
    };

    // Set initial text
    setEditorText(editor.getText());

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  // Calculate analysis stats
  const analysisStats = useMemo(() => {
    if (!editor || !editorText) {
      return {
        wordCount: 0,
        sentenceCount: 0,
        wordsPerSentence: 0,
        readingTime: 0,
      };
    }

    const trimmedText = editorText.trim();
    if (!trimmedText) {
      return {
        wordCount: 0,
        sentenceCount: 0,
        wordsPerSentence: 0,
        readingTime: 0,
      };
    }

    // Count words (split by whitespace and filter empty strings)
    const words = trimmedText.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;

    // Count sentences (split by sentence-ending punctuation)
    const sentences = trimmedText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const sentenceCount = sentences.length || 0;
    const wordsPerSentence =
      sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;

    // Reading time: average 225 words per minute
    const readingTime = Math.ceil(wordCount / 225) || 0;

    return {
      wordCount,
      sentenceCount,
      wordsPerSentence,
      readingTime,
    };
  }, [editor, editorText]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className='flex h-full flex-col'
    >
      <SidebarHeader className='px-4'>
        <TabsList className='w-full'>
          <TabsTrigger className='flex-1' value='metadata'>
            Metadata
          </TabsTrigger>
          <TabsTrigger className='flex-1' value='analysis'>
            Analysis
          </TabsTrigger>
        </TabsList>
      </SidebarHeader>
      <SidebarContent className='flex flex-1 flex-col min-h-0 overflow-hidden'>
        <TabsContent value='metadata' className='flex-1 min-h-0'>
          <ScrollArea className='h-full pr-2 [&_[data-slot=scroll-area-thumb]]:bg-foreground/10'>
            <div className='flex flex-col gap-4 px-6 py-4 text-sm'>
              {/* Visibility row */}
              <div className='mt-1 flex items-center justify-between'>
                <span className='flex items-center gap-2 text-sm font-medium'>
                  <span>Visible</span>
                  <span className='-ml-2 text-destructive'>*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Determines if the post should be displayed in API
                        response or not
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <Controller
                  control={control}
                  name='visible'
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        syncToParent();
                      }}
                    />
                  )}
                />
              </div>

              {/* Title & description */}
              <div className='mt-3 space-y-1'>
                <label className='mb-2 flex items-center gap-2 text-base font-medium text-muted-foreground'>
                  <span>Title</span>
                  <span className='-ml-2 text-destructive'>*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The main title of your post</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Input
                  className={cn(errors.title && 'border-destructive')}
                  {...register('title', {
                    onChange: handleTitleChange,
                    onBlur: handleBlur,
                  })}
                  placeholder='A great title'
                />
                {errors.title && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className='mt-3 space-y-1'>
                <label className='mb-2 flex items-center gap-2 text-base font-medium text-muted-foreground'>
                  <span>Description</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>A short description or excerpt of your post</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Textarea
                  className={cn(
                    'min-h-[80px]',
                    errors.excerpt && 'border-destructive',
                  )}
                  {...register('excerpt', { onBlur: handleBlur })}
                  placeholder='A short description of your post'
                />
                {errors.excerpt && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.excerpt.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className='mt-3 space-y-1'>
                <label className='mb-2 flex items-center gap-2 text-base font-medium text-muted-foreground'>
                  <span>Slug</span>
                  <span className='-ml-2 text-destructive'>*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Is for uniquely identifying the post in your workspace
                        and it will be used for accessing the post content via
                        API
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Input
                  className={cn(errors.slug && 'border-destructive')}
                  {...register('slug', {
                    onChange: () => {
                      slugManuallyEditedRef.current = true;
                    },
                    onBlur: () => {
                      syncToParent();
                      form.clearErrors('slug');
                    },
                  })}
                  placeholder='my-awesome-post'
                />
                {errors.slug && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Author */}
              <div className='mt-3 space-y-1'>
                <label className='mb-2 flex items-center gap-2 text-base font-medium text-muted-foreground'>
                  <span>Author</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the author of this post</p>
                    </TooltipContent>
                  </Tooltip>
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
              </div>

              {/* Category */}
              <div className='mt-3 space-y-1'>
                <label className='mb-2 flex items-center gap-2 text-base font-medium text-muted-foreground'>
                  <span>Category</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assign a category to organize your post</p>
                    </TooltipContent>
                  </Tooltip>
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
              </div>

              {/* Tags */}
              <div className='mt-3 space-y-1'>
                <label className='mb-2 flex items-center gap-2 text-base font-medium text-muted-foreground'>
                  <span>Tags</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add tags to help categorize and find your post</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
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
                      placeholder='Select some tags'
                      allowCreate
                    />
                  )}
                />
              </div>

              {/* Published at */}
              <div className='mt-4 flex items-center justify-between'>
                <span className='flex items-center gap-2 text-base font-medium text-muted-foreground'>
                  <span>Published at</span>
                  <span className='-ml-2 text-destructive'>*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The date when the post was or will be published</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <Controller
                  control={control}
                  name='publishedAt'
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className={cn(
                            'h-8 justify-start text-left font-normal px-3',
                            errors.publishedAt && 'border-destructive',
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
                      <PopoverContent className='w-auto p-0' align='end'>
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
              </div>
              {errors.publishedAt && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.publishedAt.message}
                </p>
              )}

              {/* Status row with dropdown on the side */}
              <div className='mt-4 flex items-center justify-between'>
                <span className='flex items-center gap-2 text-base font-medium text-muted-foreground'>
                  <span>Status</span>
                  <span className='-ml-2 text-destructive'>*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3.5 w-3.5 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set the post status as draft or published</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
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
                      <SelectTrigger className='h-8 w-28'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='draft'>Draft</SelectItem>
                        <SelectItem value='published'>Published</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value='analysis' className='flex-1 min-h-0'>
          <ScrollArea className='h-full pr-2 [&_[data-slot=scroll-area-thumb]]:bg-foreground/10'>
            <div className='px-6 py-4 space-y-6'>
              <div>
                <h3 className='text-base font-semibold text-foreground mb-4'>
                  Text Statistics
                </h3>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='space-y-1'>
                    <div className='text-sm text-muted-foreground'>Words</div>
                    <div className='text-lg font-semibold text-foreground'>
                      {analysisStats.wordCount.toLocaleString()}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-sm text-muted-foreground'>
                      Sentences
                    </div>
                    <div className='text-lg font-semibold text-foreground'>
                      {analysisStats.sentenceCount.toLocaleString()}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-sm text-muted-foreground'>
                      Words per Sentence
                    </div>
                    <div className='text-lg font-semibold text-foreground'>
                      {analysisStats.wordsPerSentence.toLocaleString()}
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-sm text-muted-foreground'>
                      Reading Time
                    </div>
                    <div className='text-lg font-semibold text-foreground'>
                      {analysisStats.readingTime}{' '}
                      {analysisStats.readingTime === 1 ? 'minute' : 'minutes'}
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <Separator className='bg-foreground/10' />
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Sparkles className='h-4 w-4 text-primary' />
                    <h3 className='text-base font-semibold text-foreground'>
                      AI Analysis
                    </h3>
                  </div>
                  <p className='text-xs text-muted-foreground'>Coming soon</p>
                  <p className='text-sm text-muted-foreground'>
                    Get AI-powered insights for readability, SEO optimization,
                    and content structure to enhance your post before
                    publishing.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </SidebarContent>
      <SidebarFooter>
        <div className='flex gap-2 p-4 pt-2'>
          <Button
            className='flex-1'
            size='sm'
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            {isSaving ? (
              <>
                <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex-1'
            onClick={handleClear}
            disabled={isSaving}
          >
            Clear
          </Button>
        </div>
      </SidebarFooter>
    </Tabs>
  );
}
