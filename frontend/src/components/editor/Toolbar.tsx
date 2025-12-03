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
  Table,
  Rows3,
  Columns3,
  TableCellsMerge,
  TableCellsSplit,
  TableColumnsSplit,
  TableRowsSplit,
  Trash2,
} from 'lucide-react';
import { useState, memo, useEffect, useReducer } from 'react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

export function Toolbar({ editor }: ToolbarProps) {
  const [, forceUpdate] = useReducer((state: number) => state + 1, 0);

  useEffect(() => {
    if (!editor) return;

    const update = () => forceUpdate();

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);

    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

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

        <FontFamilySelect editor={editor} />

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

        <TableMenu editor={editor} />

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
