import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
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
} from 'lucide-react';
import { useState, memo } from 'react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

export function Toolbar({ editor }: ToolbarProps) {
  return (
    <div className='border-b border-foreground/5 bg-background sticky top-0 z-10'>
      <div className='flex items-center gap-1 p-2 flex-wrap'>
        {/* Undo/Redo */}
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

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive('heading', { level: 1 })}
          title='Heading 1'
        >
          <Heading1 className='w-4 h-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          title='Heading 2'
        >
          <Heading2 className='w-4 h-4' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          title='Heading 3'
        >
          <Heading3 className='w-4 h-4' />
        </ToolbarButton>

        <Divider />

        {/* Text Formatting */}
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
        <LinkButton editor={editor} />

        <Divider />

        {/* Colors */}
        <ColorPicker editor={editor} type='text' />
        <ColorPicker editor={editor} type='highlight' />

        <Divider />

        {/* Text Alignment */}
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

        <Divider />

        {/* Lists */}
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

        <Divider />

        {/* Block Elements */}
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

        <Divider />

        {/* Clear Formatting */}
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
