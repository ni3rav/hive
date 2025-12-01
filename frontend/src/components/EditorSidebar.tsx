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
import AuthorSelect from '@/components/Author/AuthorSelect';
import TagMultiSelect from '@/components/Tag/TagMultiSelect';
import CategorySelect from '@/components/Category/CategorySelect';
import { useCreatePost } from '@/hooks/usePost';
import type { CreatePostData } from '@/types/post';
import {
  getContentFromEditor,
  isEditorEmpty as checkEditorEmpty,
} from '@/components/editor/content-utils';
import { clearWorkspacePersistence } from '@/components/editor/persistence';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function EditorSidebar() {
  const { metadata, setMetadata, editorRef, workspaceSlug } =
    useEditorContext();

  const createPostMutation = useCreatePost(workspaceSlug);

  const handleChange =
    <K extends keyof typeof metadata>(key: K) =>
    (value: (typeof metadata)[K]) => {
      setMetadata((prev) => ({ ...prev, [key]: value }));
    };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();

    setMetadata((prev) => ({
      ...prev,
      title,
      slug: slug || prev.slug,
    }));
  };

  const handleSave = () => {
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

    const { contentHtml, contentJson } = getContentFromEditor(editor);

    const postData: CreatePostData & { slug: string; publishedAt: Date } = {
      title: metadata.title,
      excerpt: metadata.excerpt || '',
      authorId: metadata.authorId,
      categorySlug: metadata.categorySlug,
      tagSlugs: metadata.tagSlugs || [],
      status: metadata.status,
      visible: metadata.visible,
      contentHtml,
      contentJson,
      slug: metadata.slug,
      publishedAt: metadata.publishedAt || new Date(),
    };

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
  };

  const handleClear = () => {
    const editor = editorRef.current?.editor;
    if (editor) {
      editor.commands.setContent('<p></p>');
    }

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

    clearWorkspacePersistence(workspaceSlug);
    clearWorkspacePersistence(undefined);
  };

  const isSaving = createPostMutation.isPending;

  return (
    <Tabs defaultValue='metadata' className='flex h-full flex-col'>
      <SidebarHeader>
        <TabsList className='w-full'>
          <TabsTrigger className='flex-1' value='metadata'>
            Metadata
          </TabsTrigger>
          <TabsTrigger className='flex-1' value='analysis'>
            Analysis
          </TabsTrigger>
        </TabsList>
      </SidebarHeader>
      <SidebarContent className='flex-1'>
        <TabsContent value='metadata' className='flex-1'>
          <div className='flex h-full flex-col gap-4 p-4 text-sm'>
            {/* Visibility row */}
            <div className='mt-1 flex items-center justify-between'>
              <span className='flex items-center gap-2 text-sm font-medium'>
                <span>Visible</span>
              </span>
              <Switch
                checked={metadata.visible}
                onCheckedChange={(checked) => handleChange('visible')(checked)}
              />
            </div>

            {/* Title & description */}
            <div className='mt-3 space-y-1'>
              <label className='mb-2 block text-base font-medium text-muted-foreground'>
                Title
              </label>
              <Input
                value={metadata.title}
                onChange={handleTitleChange}
                placeholder='A great title'
              />
            </div>

            <div className='mt-3 space-y-1'>
              <label className='mb-2 block text-base font-medium text-muted-foreground'>
                Description
              </label>
              <Textarea
                value={metadata.excerpt}
                onChange={(e) => handleChange('excerpt')(e.target.value)}
                placeholder='A short description of your post'
                className='min-h-[80px]'
              />
            </div>

            {/* Slug */}
            <div className='mt-3 space-y-1'>
              <label className='mb-2 block text-base font-medium text-muted-foreground'>
                Slug
              </label>
              <Input
                value={metadata.slug}
                onChange={(e) => handleChange('slug')(e.target.value)}
                placeholder='my-awesome-post'
              />
            </div>

            {/* Author */}
            <div className='mt-3 space-y-1'>
              <label className='mb-2 block text-base font-medium text-muted-foreground'>
                Author
              </label>
              <AuthorSelect
                value={metadata.authorId ?? null}
                onChange={(authorId) =>
                  handleChange('authorId')(authorId ?? undefined)
                }
                placeholder='Select author...'
                allowCreate
              />
            </div>

            {/* Category */}
            <div className='mt-3 space-y-1'>
              <label className='mb-2 block text-base font-medium text-muted-foreground'>
                Category
              </label>
              <CategorySelect
                value={metadata.categorySlug ?? null}
                onChange={(categorySlug) =>
                  handleChange('categorySlug')(categorySlug ?? undefined)
                }
                placeholder='Select category...'
                allowCreate
              />
            </div>

            {/* Tags */}
            <div className='mt-3 space-y-1'>
              <label className='mb-2 block text-base font-medium text-muted-foreground'>
                Tags
              </label>
              <TagMultiSelect
                value={metadata.tagSlugs || []}
                onChange={(tagSlugs) => handleChange('tagSlugs')(tagSlugs)}
                placeholder='Select some tags'
                allowCreate
              />
            </div>

            {/* Status row with dropdown on the side (moved below tags) */}
            <div className='mt-4 flex items-center justify-between'>
              <span className='text-base font-medium text-muted-foreground'>
                Status
              </span>
              <Select
                value={metadata.status}
                onValueChange={(value) =>
                  handleChange('status')(value as 'draft' | 'published')
                }
              >
                <SelectTrigger className='h-8 w-28'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='draft'>Draft</SelectItem>
                  <SelectItem value='published'>Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='analysis' className='flex-1'>
          <div className='p-4 text-sm text-muted-foreground space-y-2'>
            <p className='font-medium text-foreground'>Coming soon</p>
            <p>
              Analyze your post with AI for readability, SEO, and structure.
            </p>
            <p>
              You&apos;ll be able to get suggestions to improve clarity, tone,
              and search performance before publishing.
            </p>
          </div>
        </TabsContent>
      </SidebarContent>
      <SidebarFooter>
        <div className='flex gap-2 p-4 pt-2'>
          <Button
            className='flex-1'
            size='sm'
            onClick={handleSave}
            disabled={isSaving}
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
