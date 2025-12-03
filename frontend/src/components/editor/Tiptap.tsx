import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useImperativeHandle, forwardRef } from 'react';
import type { Editor } from '@tiptap/react';
import { loadContent, saveContent } from './persistence';
import type { ProseMirrorJSON } from './persistence';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toolbar } from './Toolbar';
import { getEditorExtensions } from './extensions';
import { EditorBubbleMenu } from './BubbleMenu';
import { EditorFloatingMenu } from './FloatingMenu';
import './tiptap.css';

interface TiptapProps {
  workspaceSlug?: string;
  initialContent?: ProseMirrorJSON | null;
  disablePersistence?: boolean;
}

export interface TiptapHandle {
  editor: Editor | null;
}

export const Tiptap = forwardRef<TiptapHandle, TiptapProps>(
  ({ workspaceSlug, initialContent, disablePersistence = false }, ref) => {
    const editor = useEditor({
      extensions: getEditorExtensions(),
      content: '<p></p>',
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        if (!disablePersistence) {
          const content = editor.getJSON();
          saveContent(content, workspaceSlug);
        }
      },
      editorProps: {
        attributes: {
          class: 'tiptap',
        },
      },
    });

    useImperativeHandle(ref, () => ({
      editor,
    }));

    useEffect(() => {
      if (!editor) return;

      if (initialContent) {
        editor.commands.setContent(initialContent);
        return;
      }

      const savedContent = loadContent(workspaceSlug);
      if (savedContent) {
        editor.commands.setContent(savedContent);
      } else {
        editor.commands.setContent('<p></p>');
      }
    }, [workspaceSlug, editor, initialContent]);

    if (!editor) {
      return null;
    }

    return (
      <div className='h-full w-full bg-background text-foreground border border-foreground/5 rounded-lg overflow-hidden flex flex-col'>
        <Toolbar editor={editor} />
        <div className='flex-1 min-h-0 overflow-hidden border-t border-foreground/5'>
          <ScrollArea className='h-full [&_[data-slot=scroll-area-thumb]]:bg-foreground/20 [&_[data-slot=scroll-area-scrollbar]]:border-l-0'>
            <div className='p-4 min-h-full max-w-full overflow-x-hidden'>
              <EditorFloatingMenu editor={editor} />
              <EditorBubbleMenu editor={editor} />
              <EditorContent editor={editor} />
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  },
);

Tiptap.displayName = 'Tiptap';
