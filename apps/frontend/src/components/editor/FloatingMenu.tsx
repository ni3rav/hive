import { FloatingMenu as TiptapFloatingMenu } from '@tiptap/react/menus';
import { type Editor } from '@tiptap/core';
import {
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  type LucideIcon,
} from 'lucide-react';
import { memo, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface EditorFloatingMenuProps {
  editor: Editor;
}

type FloatingMenuShouldShow = NonNullable<
  ComponentProps<typeof TiptapFloatingMenu>['shouldShow']
>;

const floatingMenuShouldShow: FloatingMenuShouldShow = ({ editor, state }) => {
  if (!editor || !editor.isEditable) {
    return false;
  }

  const { selection } = state;

  if (!selection.empty) {
    return false;
  }

  const { $from } = selection;
  const parent = $from.parent;

  if (!parent || !parent.isTextblock) {
    return false;
  }

  if (
    editor.isActive('codeBlock') ||
    editor.isActive('table') ||
    editor.isActive('listItem') ||
    editor.isActive('taskItem')
  ) {
    return false;
  }

  const isTopLevelParagraph =
    parent.type.name === 'paragraph' && $from.depth === 1;
  const isEmpty = parent.content.size === 0;

  return isTopLevelParagraph && isEmpty;
};

const MenuButton = ({
  onClick,
  title,
  icon: Icon,
}: {
  onClick: () => void;
  title: string;
  icon: LucideIcon;
}) => (
  <button
    type='button'
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={cn(
      'flex size-9 items-center justify-center rounded-md border border-transparent bg-background/90 text-foreground/80 transition-colors hover:border-foreground/15 hover:bg-foreground/10 hover:text-foreground',
    )}
    title={title}
    aria-label={title}
  >
    <Icon className='h-4 w-4' />
  </button>
);

const menuItems = [
  {
    title: 'Heading 1',
    icon: Heading1,
    action: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    icon: Heading2,
    action: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Bullet List',
    icon: List,
    action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Ordered List',
    icon: ListOrdered,
    action: (editor: Editor) =>
      editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'Task List',
    icon: CheckSquare,
    action: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: 'Quote',
    icon: Quote,
    action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Code Block',
    icon: Code,
    action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
] as const;

export const EditorFloatingMenu = memo(
  ({ editor }: EditorFloatingMenuProps) => {
    return (
      <TiptapFloatingMenu
        editor={editor}
        shouldShow={floatingMenuShouldShow}
        className='inline-flex items-center gap-1 rounded-md border border-foreground/10 bg-background/95 px-2 py-1 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 floating-menu-below'
      >
        {menuItems.map((item) => (
          <MenuButton
            key={item.title}
            title={item.title}
            icon={item.icon}
            onClick={() => item.action(editor)}
          />
        ))}
      </TiptapFloatingMenu>
    );
  },
);

EditorFloatingMenu.displayName = 'EditorFloatingMenu';
