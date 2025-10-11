import './tiptap.css';
import { cn } from '@/lib/utils';
import { EditorContent, useEditor } from '@tiptap/react';
import { FloatingToolbar } from '@/components/tiptap/extensions/floating-toolbar';
import { EditorToolbar } from './toolbars/editor-toolbar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function RichTextEditorDemo({
  className,
  editor,
}: {
  className?: string;
  editor: ReturnType<typeof useEditor>;
}) {
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
      </ScrollArea>
    </div>
  );
}
