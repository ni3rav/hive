import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Text,
  Quote,
  Minus,
  Table,
  Youtube,
  Image,
} from 'lucide-react';
import { ReactRenderer } from '@tiptap/react';
import type { Editor, Range } from '@tiptap/react';
import tippy from 'tippy.js';
import type { Instance, Props as TippyProps } from 'tippy.js';
import { CommandList } from './CommandList';
import type {
  CommandListRef,
  CommandListProps,
  CommandItemProps,
} from './CommandList';

interface SuggestionProps {
  query: string;
}

interface SuggestionRendererProps {
  editor: Editor;
  clientRect: (() => DOMRect) | null;
  event: KeyboardEvent;
  items: CommandItemProps[];
  command: (item: CommandItemProps) => void;
  decorationNode: Element | null;
  range: Range;
}

interface CommandFunctionProps {
  editor: Editor;
  range: Range;
}

export const getSuggestionItems = ({
  query,
}: SuggestionProps): CommandItemProps[] => {
  return [
    {
      title: 'Text',
      description: 'Just start typing with plain text.',
      searchTerms: ['p', 'paragraph'],
      icon: Text,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleNode('paragraph', 'paragraph')
          .run();
      },
    },
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      searchTerms: ['title', 'big', 'large'],
      icon: Heading1,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 1 })
          .run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      searchTerms: ['subtitle', 'medium'],
      icon: Heading2,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 2 })
          .run();
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      searchTerms: ['subtitle', 'small'],
      icon: Heading3,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 3 })
          .run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list.',
      searchTerms: ['unordered', 'point'],
      icon: List,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering.',
      searchTerms: ['ordered'],
      icon: ListOrdered,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Task List',
      description: 'Track tasks with a todo list.',
      searchTerms: ['todo', 'task', 'check'],
      icon: CheckSquare,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Table',
      description: 'Add a 3x3 table.',
      searchTerms: ['grid'],
      icon: Table,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
    },
    {
      title: 'YouTube Video',
      description: 'Embed a YouTube player.',
      searchTerms: ['video', 'youtube', 'yt'],
      icon: Youtube,
      command: ({ editor, range }: CommandFunctionProps) => {
        const url = window.prompt('Paste a YouTube or youtu.be URL');
        if (!url) {
          return;
        }
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setYoutubeVideo({ src: url })
          .run();
      },
    },
    {
      title: 'Image',
      description: 'Insert an image from URL.',
      searchTerms: ['photo', 'picture', 'img'],
      icon: Image,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor.chain().focus().deleteRange(range).run();
        setTimeout(() => {
          if ((editor as any).openImageDialog) {
            (editor as any).openImageDialog();
          }
        }, 100);
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      searchTerms: ['blockquote'],
      icon: Quote,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor.chain().focus().deleteRange(range).setBlockquote().run();
      },
    },
    {
      title: 'Divider',
      description: 'Visually divide content.',
      searchTerms: ['line', 'hr'],
      icon: Minus,
      command: ({ editor, range }: CommandFunctionProps) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ]
    .filter((item) => {
      if (typeof query === 'string' && query.length > 0) {
        const search = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          (item.searchTerms &&
            item.searchTerms.some((term) => term.includes(search)))
        );
      }
      return true;
    })
    .slice(0, 10);
};

export const renderItems = () => {
  let component: ReactRenderer<CommandListRef, CommandListProps> | undefined;
  let popup: Instance<TippyProps> | undefined;

  return {
    onStart: (props: SuggestionRendererProps) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy(document.body, {
        getReferenceClientRect: props.clientRect as
          | (() => DOMRect)
          | (() => ClientRect),
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        offset: [0, 16],
      });
    },

    onUpdate: (props: SuggestionRendererProps) => {
      component?.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup?.setProps({
        getReferenceClientRect: props.clientRect as
          | (() => DOMRect)
          | (() => ClientRect),
      });
    },

    onKeyDown: (props: SuggestionRendererProps) => {
      if (props.event.key === 'Escape') {
        popup?.hide();

        return true;
      }

      return component?.ref?.onKeyDown(props) || false;
    },

    onExit: () => {
      popup?.destroy();
      component?.destroy();
    },
  };
};
