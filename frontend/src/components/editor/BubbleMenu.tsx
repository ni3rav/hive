import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus';
import { type Editor } from '@tiptap/core';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  type LucideIcon,
} from 'lucide-react';
import { memo, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface EditorBubbleMenuProps {
  editor: Editor;
}

const bubbleMenuShouldShow: NonNullable<
  ComponentProps<typeof TiptapBubbleMenu>['shouldShow']
> = ({ editor, state }) => {
  if (!editor || !editor.isEditable) {
    return false;
  }

  const { empty } = state.selection;
  if (empty) {
    return false;
  }

  // Avoid showing when the selection is within nodes that usually don't take text marks.
  if (editor.isActive('codeBlock') || editor.isActive('image')) {
    return false;
  }

  return true;
};

const MenuButton = ({
  onClick,
  isActive,
  title,
  icon: Icon,
}: {
  onClick: () => void;
  isActive: boolean;
  title: string;
  icon: LucideIcon;
}) => (
  <button
    type='button'
    title={title}
    onMouseDown={(event) => {
      event.preventDefault();
    }}
    onClick={onClick}
    className={cn(
      'flex size-8 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-foreground/10',
      isActive && 'bg-foreground/10 text-primary',
    )}
  >
    <Icon className='h-4 w-4' />
  </button>
);

export const EditorBubbleMenu = memo(({ editor }: EditorBubbleMenuProps) => {
  return (
    <TiptapBubbleMenu
      editor={editor}
      className='flex items-center gap-1 rounded-lg border border-foreground/10 bg-background/95 px-2 py-1 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80'
      shouldShow={bubbleMenuShouldShow}
      updateDelay={150}
    >
      <MenuButton
        title='Bold'
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        icon={Bold}
      />
      <MenuButton
        title='Italic'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        icon={Italic}
      />
      <MenuButton
        title='Underline'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        icon={UnderlineIcon}
      />
      <MenuButton
        title='Strikethrough'
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        icon={Strikethrough}
      />
      <MenuButton
        title='Inline code'
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        icon={Code}
      />
    </TiptapBubbleMenu>
  );
});

EditorBubbleMenu.displayName = 'EditorBubbleMenu';
