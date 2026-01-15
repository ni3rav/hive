import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Link as LinkIcon,
  Unlink,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RemoveFormatting,
  Highlighter,
  Palette,
  Table,
  Rows3,
  Columns3,
  TableCellsMerge,
  TableCellsSplit,
  TableColumnsSplit,
  TableRowsSplit,
  Trash2,
  Youtube,
  Image,
  Expand,
  X,
} from 'lucide-react';
import {
  useState,
  memo,
  useEffect,
  useReducer,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { cn } from '@/lib/utils';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { useMedia } from '@/hooks/useMedia';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { thumbHashToDataURL } from 'thumbhash';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

interface ToolbarProps {
  editor: Editor;
}

const ToolbarButton = ({
  onClick,
  isActive = false,
  children,
  disabled = false,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  title: string;
}) => (
  <button
    type='button'
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'p-2 rounded hover:bg-muted transition-colors',
      isActive && 'bg-muted text-primary',
      disabled && 'opacity-50 cursor-not-allowed',
    )}
  >
    {children}
  </button>
);

const Divider = () => <div className='w-px h-6 bg-border' />;

const urlSchema = z.string().url();
const youtubeUrlSchema = z
  .url()
  .refine(
    (value) =>
      value.includes('youtube.com') ||
      value.includes('youtu.be') ||
      value.includes('music.youtube.com'),
    {
      message: 'Enter a valid YouTube URL',
    },
  );

const LinkButton = memo(({ editor }: { editor: Editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const setLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setIsLinkPopoverOpen(false);
      setError('');
      return;
    }

    // Validate URL using Zod
    const result = urlSchema.safeParse(linkUrl);
    if (!result.success) {
      setError('Please enter a valid URL');
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl })
      .run();
    setLinkUrl('');
    setIsLinkPopoverOpen(false);
    setError('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsLinkPopoverOpen(open);
    if (open) {
      const previousUrl = editor.getAttributes('link').href || '';
      setLinkUrl(previousUrl);
      setError('');
    } else {
      setError('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkUrl(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Popover open={isLinkPopoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type='button'
          title='Insert Link (Ctrl+K)'
          className={cn(
            'p-2 rounded hover:bg-muted transition-colors',
            editor.isActive('link') && 'bg-muted text-primary',
          )}
        >
          <LinkIcon className='w-4 h-4' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <div className='space-y-3'>
          <h4 className='font-medium text-sm'>Insert Link</h4>
          <div>
            <Input
              placeholder='https://example.com'
              value={linkUrl}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setLink();
                }
              }}
              className={cn(error && 'border-destructive')}
              autoFocus
            />
            {error && <p className='text-xs text-destructive mt-1'>{error}</p>}
          </div>
          <div className='flex gap-2'>
            <Button onClick={setLink} size='sm' className='flex-1'>
              {linkUrl && editor.isActive('link') ? 'Update' : 'Insert'}
            </Button>
            {editor.isActive('link') && (
              <Button
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  setIsLinkPopoverOpen(false);
                }}
                size='sm'
                variant='outline'
              >
                <Unlink className='w-4 h-4' />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

LinkButton.displayName = 'LinkButton';

const ColorPicker = memo(
  ({ editor, type }: { editor: Editor; type: 'text' | 'highlight' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const colors = [
      { name: 'Default', value: 'default' },
      { name: 'Red', value: '#ef4444' },
      { name: 'Orange', value: '#f97316' },
      { name: 'Yellow', value: '#eab308' },
      { name: 'Green', value: '#22c55e' },
      { name: 'Blue', value: '#3b82f6' },
      { name: 'Purple', value: '#a855f7' },
      { name: 'Pink', value: '#ec4899' },
    ];

    const setColor = (color: string) => {
      if (type === 'text') {
        if (color === 'default') {
          editor.chain().focus().unsetColor().run();
        } else {
          editor.chain().focus().setColor(color).run();
        }
      } else {
        if (color === 'default') {
          editor.chain().focus().unsetHighlight().run();
        } else {
          // Use backgroundColor for highlight instead of color
          editor.chain().focus().toggleHighlight({ color }).run();
        }
      }
      setIsOpen(false);
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            title={type === 'text' ? 'Text Color' : 'Highlight'}
            className={cn(
              'p-2 rounded hover:bg-muted transition-colors',
              ((type === 'text' && editor.getAttributes('textStyle').color) ||
                (type === 'highlight' && editor.isActive('highlight'))) &&
                'bg-muted text-primary',
            )}
          >
            {type === 'text' ? (
              <Palette className='w-4 h-4' />
            ) : (
              <Highlighter className='w-4 h-4' />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-48'>
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>
              {type === 'text' ? 'Text Color' : 'Highlight Color'}
            </h4>
            <div className='grid grid-cols-4 gap-2'>
              {colors.map((color) => (
                <button
                  key={color.name}
                  type='button'
                  onClick={() => setColor(color.value)}
                  className='w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors flex items-center justify-center'
                  style={{
                    backgroundColor:
                      color.value === 'default' ? 'transparent' : color.value,
                  }}
                  title={color.name}
                >
                  {color.value === 'default' && (
                    <span className='text-xs font-bold'>×</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

ColorPicker.displayName = 'ColorPicker';

const YoutubeButton = memo(({ editor }: { editor: Editor }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const insertVideo = () => {
    const result = youtubeUrlSchema.safeParse(videoUrl.trim());
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Invalid URL');
      return;
    }

    editor
      .chain()
      .focus()
      .setYoutubeVideo({
        src: videoUrl.trim(),
      })
      .run();

    setVideoUrl('');
    setError('');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          title='Insert YouTube video'
          className={cn(
            'p-2 rounded hover:bg-muted transition-colors',
            editor.isActive('youtube') && 'bg-muted text-primary',
          )}
        >
          <Youtube className='w-4 h-4' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-80'>
        <div className='space-y-3'>
          <h4 className='font-medium text-sm'>Embed YouTube Video</h4>
          <div>
            <Input
              placeholder='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  insertVideo();
                }
              }}
              className={cn(error && 'border-destructive')}
              autoFocus
            />
            <p className='text-xs text-muted-foreground mt-1'>
              Supports youtube.com and youtu.be links.
            </p>
            {error && <p className='text-xs text-destructive mt-1'>{error}</p>}
          </div>
          <div className='flex gap-2'>
            <Button onClick={insertVideo} size='sm' className='flex-1'>
              Embed
            </Button>
            {editor.isActive('youtube') && (
              <Button
                onClick={() => {
                  editor.commands.focus();
                  setIsOpen(false);
                }}
                size='sm'
                variant='outline'
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

YoutubeButton.displayName = 'YoutubeButton';

function MediaThumbnail({
  media,
  onInsert,
}: {
  media: {
    id: string;
    publicUrl: string;
    filename: string;
    thumbhashBase64?: string | null;
  };
  onInsert: (mediaId: string) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [placeholderUrl, setPlaceholderUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (media.thumbhashBase64 && !imageLoaded) {
      try {
        const thumbhashBytes = Uint8Array.from(
          atob(media.thumbhashBase64),
          (c) => c.charCodeAt(0),
        );
        const dataUrl = thumbHashToDataURL(thumbhashBytes);
        setPlaceholderUrl(dataUrl);
      } catch {
        setPlaceholderUrl(null);
      }
    }
  }, [media.thumbhashBase64, imageLoaded]);

  return (
    <>
      <div
        className='group relative aspect-square border border-foreground/5 rounded-lg overflow-hidden bg-muted'
        title={media.filename}
      >
        <div className='absolute inset-0 z-[5] bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none' />

        <div className='absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200'>
          <button
            type='button'
            className='h-6 w-6 flex items-center justify-center rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors'
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewOpen(true);
            }}
          >
            <Expand className='w-3 h-3' />
          </button>
        </div>

        <button
          type='button'
          className='w-full h-full relative'
          onClick={() => onInsert(media.id)}
        >
          {placeholderUrl && !imageLoaded && (
            <img
              src={placeholderUrl}
              alt={media.filename}
              className='absolute inset-0 w-full h-full object-cover'
              aria-hidden='true'
            />
          )}
          <img
            src={media.publicUrl}
            alt={media.filename}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setImageLoaded(true)}
          />
        </button>
      </div>

      {isPreviewOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm animate-in fade-in-0'
          onClick={() => setIsPreviewOpen(false)}
        >
          <button
            type='button'
            className='absolute top-4 right-4 p-2 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors text-foreground'
            onClick={() => setIsPreviewOpen(false)}
          >
            <X className='w-6 h-6' />
          </button>
          <div
            className='max-w-5xl max-h-[90vh] p-4 flex flex-col items-center gap-4'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={media.publicUrl}
              alt={media.filename}
              className='max-w-full max-h-[80vh] object-contain rounded-lg'
            />
            <p className='text-foreground text-sm font-medium bg-muted/90 px-4 py-2 rounded-lg max-w-full break-all'>
              {media.filename}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export interface ImageButtonRef {
  openDialog: () => void;
}

const ImageButton = forwardRef<ImageButtonRef, { editor: Editor }>(
  ({ editor }, ref) => {
    const workspaceSlug = useWorkspaceSlug();
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: mediaItems = [], isLoading: isLoadingMedia } = useMedia(
      workspaceSlug || '',
    );
    const {
      uploadImageAsync,
      isPending: isUploading,
      progress,
      uploadStage,
    } = useMediaUpload(workspaceSlug || '');

    useImperativeHandle(ref, () => ({
      openDialog: () => setIsOpen(true),
    }));

    const insertMediaImage = (url: string, mediaId?: string) => {
      const attrs: { src: string; 'data-media-id'?: string } = { src: url };
      if (mediaId) {
        attrs['data-media-id'] = mediaId;
      }
      editor.chain().focus().setImage(attrs).run();
      setIsOpen(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !workspaceSlug) return;

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setError('');
      uploadImageAsync(file, (_progress, stage) => {
        if (stage === 'complete') {
          setIsOpen(false);
        }
      })
        .then((media) => {
          if (media) {
            insertMediaImage(media.publicUrl);
          }
        })
        .catch(() => {
          setError('Failed to upload image');
        });
      e.target.value = '';
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            title='Insert Image'
            className={cn(
              'p-2 rounded hover:bg-muted transition-colors',
              editor.isActive('image') && 'bg-muted text-primary',
            )}
          >
            <Image className='w-4 h-4' />
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-96'>
          <div className='space-y-3'>
            <h4 className='font-medium text-sm'>Insert Image</h4>

            {/* Tabs */}
            <div className='flex gap-1 border-b'>
              <button
                className={cn(
                  'px-3 py-1.5 text-sm transition-colors border-b-2',
                  activeTab === 'upload'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </button>
              <button
                className={cn(
                  'px-3 py-1.5 text-sm transition-colors border-b-2',
                  activeTab === 'library'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setActiveTab('library')}
              >
                Media Library ({mediaItems.length})
              </button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className='space-y-3'>
                <p className='text-xs text-muted-foreground'>
                  Upload an image from your computer
                </p>
                {!workspaceSlug ? (
                  <p className='text-xs text-destructive'>
                    Workspace not found
                  </p>
                ) : (
                  <>
                    <Button
                      size='sm'
                      variant='outline'
                      className='w-full'
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          Uploading...
                        </>
                      ) : (
                        'Choose File'
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleFileUpload}
                    />
                    {isUploading && (
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-xs'>
                          <span>
                            {uploadStage === 'generating' &&
                              'Generating upload URL...'}
                            {uploadStage === 'uploading' &&
                              'Uploading to cloud...'}
                            {uploadStage === 'confirming' && 'Saving...'}
                          </span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-primary transition-all duration-300'
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {error && (
                      <p className='text-xs text-destructive'>{error}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Media Library Tab */}
            {activeTab === 'library' && (
              <div className='space-y-3'>
                {!workspaceSlug ? (
                  <div className='text-center py-8 text-sm text-muted-foreground'>
                    Workspace not found
                  </div>
                ) : isLoadingMedia ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className='text-center py-8 text-sm text-muted-foreground'>
                    No images in media library yet.
                    <br />
                    Upload images from the Upload tab.
                  </div>
                ) : (
                  <ScrollArea className='h-64'>
                    <div className='grid grid-cols-3 gap-2 p-1'>
                      {mediaItems.map((media) => (
                        <MediaThumbnail
                          key={media.id}
                          media={media}
                          onInsert={(mediaId) =>
                            insertMediaImage(media.publicUrl, mediaId)
                          }
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

ImageButton.displayName = 'ImageButton';

const fontOptions = [
  {
    label: 'Default (Sans)',
    value: 'default',
    fontFamily: null,
    previewFamily: 'var(--font-sans)',
  },
  {
    label: 'Serif',
    value: 'serif',
    fontFamily: 'Crimson Pro, serif',
    previewFamily: '"Crimson Pro", serif',
  },
  {
    label: 'Mono',
    value: 'mono',
    fontFamily: 'Geist Mono, monospace',
    previewFamily: '"Geist Mono", monospace',
  },
] as const;

type FontOptionValue = (typeof fontOptions)[number]['value'];

const FontFamilySelect = ({ editor }: { editor: Editor }) => {
  const [currentValue, setCurrentValue] = useState<FontOptionValue>('default');

  useEffect(() => {
    const syncValue = () => {
      const activeFontFamily = (editor.getAttributes('textStyle').fontFamily ||
        '') as string;

      if (!activeFontFamily) {
        setCurrentValue('default');
        return;
      }

      const normalizedActive = activeFontFamily
        .replace(/['"\s,]/g, '')
        .toLowerCase();

      const match = fontOptions.find((option) => {
        if (!option.fontFamily) {
          return false;
        }
        return (
          option.fontFamily.replace(/['"\s,]/g, '').toLowerCase() ===
          normalizedActive
        );
      });

      setCurrentValue(match ? match.value : 'default');
    };

    syncValue();
    editor.on('selectionUpdate', syncValue);
    editor.on('transaction', syncValue);

    return () => {
      editor.off('selectionUpdate', syncValue);
      editor.off('transaction', syncValue);
    };
  }, [editor]);

  const handleChange = (value: FontOptionValue) => {
    if (value === 'default') {
      const didRun = editor.chain().focus().unsetFontFamily().run();
      if (didRun) {
        setCurrentValue('default');
      }
      return;
    }

    const option = fontOptions.find((item) => item.value === value);
    if (option?.fontFamily) {
      const didRun = editor
        .chain()
        .focus()
        .setFontFamily(option.fontFamily)
        .run();
      if (didRun) {
        setCurrentValue(value);
      }
    }
  };

  return (
    <Select
      value={currentValue}
      onValueChange={handleChange}
      disabled={!editor.isEditable}
    >
      <SelectTrigger size='sm' className='w-[9rem] justify-start'>
        <SelectValue placeholder='Font family' />
      </SelectTrigger>
      <SelectContent align='start'>
        {fontOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span style={{ fontFamily: option.previewFamily }}>
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const TableMenu = ({ editor }: { editor: Editor }) => {
  const isTableActive = ['table', 'tableCell', 'tableHeader', 'tableRow'].some(
    (node) => editor.isActive(node),
  );
  const canInsertTable = editor
    .can()
    .chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run();
  const tableCommandEnabled = isTableActive;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          title='Table actions'
          className={cn(
            'p-2 rounded hover:bg-muted transition-colors',
            isTableActive && 'bg-muted text-primary',
          )}
        >
          <Table className='w-4 h-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuItem
          disabled={!canInsertTable}
          onSelect={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Table className='w-4 h-4' />
          <span>Create 3x3 table</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().addRowBefore().run()}
        >
          <Rows3 className='w-4 h-4' />
          <span>Add row above</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().addRowAfter().run()}
        >
          <Rows3 className='w-4 h-4' />
          <span>Add row below</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().deleteRow().run()}
        >
          <Rows3 className='w-4 h-4' />
          <span>Delete row</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().addColumnBefore().run()}
        >
          <Columns3 className='w-4 h-4' />
          <span>Add column left</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().addColumnAfter().run()}
        >
          <Columns3 className='w-4 h-4' />
          <span>Add column right</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().deleteColumn().run()}
        >
          <Columns3 className='w-4 h-4' />
          <span>Delete column</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().toggleHeaderRow().run()}
        >
          <TableRowsSplit className='w-4 h-4' />
          <span>Toggle header row</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().toggleHeaderColumn().run()}
        >
          <TableColumnsSplit className='w-4 h-4' />
          <span>Toggle header column</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().mergeCells().run()}
        >
          <TableCellsMerge className='w-4 h-4' />
          <span>Merge cells</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().splitCell().run()}
        >
          <TableCellsSplit className='w-4 h-4' />
          <span>Split cell</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!tableCommandEnabled}
          onSelect={() => editor.chain().focus().deleteTable().run()}
          variant='destructive'
        >
          <Trash2 className='w-4 h-4' />
          <span>Delete table</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HistoryControls = ({ editor }: { editor: Editor }) => (
  <>
    <ToolbarButton
      onClick={() => editor.chain().focus().undo().run()}
      disabled={!editor.can().undo()}
      title='Undo'
    >
      <Undo className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().redo().run()}
      disabled={!editor.can().redo()}
      title='Redo'
    >
      <Redo className='w-4 h-4' />
    </ToolbarButton>
  </>
);

const HeadingControls = ({ editor }: { editor: Editor }) => (
  <>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      isActive={editor.isActive('heading', { level: 1 })}
      title='Heading 1'
    >
      <Heading1 className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      isActive={editor.isActive('heading', { level: 2 })}
      title='Heading 2'
    >
      <Heading2 className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      isActive={editor.isActive('heading', { level: 3 })}
      title='Heading 3'
    >
      <Heading3 className='w-4 h-4' />
    </ToolbarButton>
  </>
);

const BasicFormattingControls = ({ editor }: { editor: Editor }) => (
  <>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleBold().run()}
      isActive={editor.isActive('bold')}
      title='Bold (Ctrl+B)'
    >
      <Bold className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleItalic().run()}
      isActive={editor.isActive('italic')}
      title='Italic (Ctrl+I)'
    >
      <Italic className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleStrike().run()}
      isActive={editor.isActive('strike')}
      title='Strikethrough'
    >
      <Strikethrough className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleUnderline().run()}
      isActive={editor.isActive('underline')}
      title='Underline (Ctrl+U)'
    >
      <UnderlineIcon className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleCode().run()}
      isActive={editor.isActive('code')}
      title='Code'
    >
      <Code className='w-4 h-4' />
    </ToolbarButton>
  </>
);

const AlignmentControls = ({ editor }: { editor: Editor }) => (
  <>
    <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign('left').run()}
      isActive={false}
      title='Align Left'
    >
      <AlignLeft className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign('center').run()}
      isActive={false}
      title='Align Center'
    >
      <AlignCenter className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign('right').run()}
      isActive={false}
      title='Align Right'
    >
      <AlignRight className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      isActive={false}
      title='Justify'
    >
      <AlignJustify className='w-4 h-4' />
    </ToolbarButton>
  </>
);

const ListControls = ({ editor }: { editor: Editor }) => (
  <>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      isActive={editor.isActive('bulletList')}
      title='Bullet List'
    >
      <List className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      isActive={editor.isActive('orderedList')}
      title='Numbered List'
    >
      <ListOrdered className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleTaskList().run()}
      isActive={editor.isActive('taskList')}
      title='Task List'
    >
      <CheckSquare className='w-4 h-4' />
    </ToolbarButton>
  </>
);

const BlockControls = ({ editor }: { editor: Editor }) => (
  <>
    <ToolbarButton
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      isActive={editor.isActive('blockquote')}
      title='Quote'
    >
      <Quote className='w-4 h-4' />
    </ToolbarButton>
    <ToolbarButton
      onClick={() => editor.chain().focus().setHorizontalRule().run()}
      title='Horizontal Rule'
    >
      <Minus className='w-4 h-4' />
    </ToolbarButton>
  </>
);

export function Toolbar({ editor }: ToolbarProps) {
  const [, forceUpdate] = useReducer((state: number) => state + 1, 0);
  const imageButtonRef = useRef<ImageButtonRef>(null);

  useEffect(() => {
    if (!editor) return;

    const update = () => forceUpdate();

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);

    // Listen for custom event to open image dialog
    const handleOpenImageDialog = () => {
      imageButtonRef.current?.openDialog();
    };

    (editor as Editor & { openImageDialog?: () => void }).openImageDialog =
      handleOpenImageDialog;

    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
      delete (editor as Editor & { openImageDialog?: () => void })
        .openImageDialog;
    };
  }, [editor]);

  return (
    <div className='border-b border-foreground/5 bg-background sticky top-0 z-10'>
      <div className='flex items-center gap-1 p-2 flex-wrap'>
        <HistoryControls editor={editor} />
        <Divider />
        <HeadingControls editor={editor} />
        <Divider />
        <BasicFormattingControls editor={editor} />
        <LinkButton editor={editor} />
        <YoutubeButton editor={editor} />
        <ImageButton ref={imageButtonRef} editor={editor} />
        <Divider />
        <FontFamilySelect editor={editor} />
        <Divider />
        <ColorPicker editor={editor} type='text' />
        <ColorPicker editor={editor} type='highlight' />
        <Divider />
        <AlignmentControls editor={editor} />
        <Divider />
        <ListControls editor={editor} />
        <Divider />
        <TableMenu editor={editor} />
        <Divider />
        <BlockControls editor={editor} />
        <Divider />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          title='Clear Formatting'
        >
          <RemoveFormatting className='w-4 h-4' />
        </ToolbarButton>
      </div>
    </div>
  );
}
