import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useImperativeHandle, forwardRef } from 'react';
import type { Editor } from '@tiptap/react';
import { loadContent, saveContent } from './persistence';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toolbar } from './Toolbar';
import { getEditorExtensions } from './extensions';
import './tiptap.css';

interface TiptapProps {
  workspaceSlug?: string;
}

export interface TiptapHandle {
  editor: Editor | null;
}

export const Tiptap = forwardRef<TiptapHandle, TiptapProps>(
  ({ workspaceSlug }, ref) => {
    const editor = useEditor({
      extensions: getEditorExtensions(),
      content: '<p></p>',
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        const content = editor.getJSON();
        saveContent(content, workspaceSlug);
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

      const savedContent = loadContent(workspaceSlug);
      if (savedContent) {
        editor.commands.setContent(savedContent);
      } else {
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
  },
);

Tiptap.displayName = 'Tiptap';
