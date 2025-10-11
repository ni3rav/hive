import './tiptap.css';
import { cn } from '@/lib/utils';
import SearchAndReplace from '@/components/tiptap/extensions/search-and-replace';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import { EditorContent, type Extension, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FloatingToolbar } from '@/components/tiptap/extensions/floating-toolbar';
import { EditorToolbar } from './toolbars/editor-toolbar';
import Placeholder from '@tiptap/extension-placeholder';
import { createPersistenceHandlers } from './persistence';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FloatingSaveDownload } from './floating-save-download';

const extensions = [
  StarterKit.configure({
    orderedList: { HTMLAttributes: { class: 'list-decimal' } },
    bulletList: { HTMLAttributes: { class: 'list-disc' } },
    heading: { levels: [1, 2, 3, 4] },
  }),
  Placeholder.configure({
    emptyNodeClass: 'is-editor-empty',
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case 'heading':
          return `Heading ${node.attrs.level}`;
        case 'detailsSummary':
          return 'Section title';
        case 'codeBlock':
          return '';
        default:
          return 'Start typing...';
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({ multicolor: true }),
  SearchAndReplace,
  Typography,
];

export function RichTextEditorDemo({ className }: { className?: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    editorProps: {
      attributes: {
        class: 'max-w-full focus:outline-none',
      },
    },
    ...createPersistenceHandlers(),
  });

  if (!editor) return null;

  return (
    <div className='relative h-full flex flex-col'>
      <ScrollArea
        className={cn(
          'relative h-full w-full border bg-card pb-0 [&_[data-slot=scroll-area-scrollbar]]:w-1.5 [&_[data-slot=scroll-area-thumb]]:bg-primary/50',
          className,
        )}
      >
        <EditorToolbar editor={editor} />
        <FloatingToolbar editor={editor} />
        <EditorContent
          editor={editor}
          className='min-h-[600px] w-full min-w-full cursor-text'
        />
        <FloatingSaveDownload editor={editor} />
      </ScrollArea>
    </div>
  );
}
