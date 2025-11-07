import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useEffect } from 'react';
import { loadContent, saveContent } from './persistence';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toolbar } from './Toolbar';
import './tiptap.css';

interface TiptapProps {
  workspaceSlug?: string;
}

export function Tiptap({ workspaceSlug }: TiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      saveContent(content, workspaceSlug);
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const savedContent = loadContent(workspaceSlug);
    if (savedContent && typeof savedContent === 'string') {
      editor.commands.setContent(savedContent);
    } else if (!savedContent) {
      editor.commands.setContent('<p></p>');
    }
  }, [workspaceSlug, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className='h-full w-full bg-background text-foreground border-border rounded-lg overflow-hidden border flex flex-col'>
      <Toolbar editor={editor} />
      <div className='flex-1 min-h-0'>
        <ScrollArea className='h-full'>
          <div className='p-4 min-h-full'>
            <EditorContent editor={editor} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
