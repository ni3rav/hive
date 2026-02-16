import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useImperativeHandle, forwardRef, useCallback, useState, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { loadContent, saveContent } from './persistence';
import type { ProseMirrorJSON } from './persistence';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toolbar } from './Toolbar';
import { getEditorExtensions } from './extensions';
import { EditorBubbleMenu } from './BubbleMenu';
import { EditorFloatingMenu } from './FloatingMenu';
import { useEditorContext } from '@/components/editor/editor-context';
import { parseMarkdown, markdownToProseMirrorJSON } from '@/lib/markdown-import';
import { toast } from 'sonner';
import './tiptap.css';

const IMAGE_WARNING =
  'Images in markdown are not supported. Raw text inserted—add images manually.';

function isMarkdownDrop(event: DragEvent): boolean {
  const files = event.dataTransfer?.files;
  if (files?.length) {
    return Array.from(files).some((f) => f.name.toLowerCase().endsWith('.md'));
  }
  return event.dataTransfer?.types.includes('text/plain') ?? false;
}

function isMarkdownPaste(text: string): boolean {
  const t = text.trim();
  return t.length > 0 && (t.startsWith('---') || /^#+\s/m.test(t) || /^[-*]\s/m.test(t));
}

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
    const { setMetadata } = useEditorContext();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const dragCounterRef = useRef(0);
    const editorRefForPaste = useRef<Editor | null>(null);

    const applyMarkdownImport = useCallback(
      (raw: string, editorInstance: Editor) => {
        const { frontmatter, content, hasImages } = parseMarkdown(raw);

        if (hasImages) {
          toast.warning(IMAGE_WARNING);
          editorInstance.commands.insertContent({
            type: 'codeBlock',
            content: [{ type: 'text', text: raw }],
          });
          return;
        }

        setMetadata((prev) => ({ ...prev, ...frontmatter }));
        const json = markdownToProseMirrorJSON(content);
        editorInstance.commands.setContent(json);
        toast.success('Markdown imported');
      },
      [setMetadata],
    );

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
        handlePaste: (_view, event) => {
          const text = event.clipboardData?.getData('text/plain');
          if (!text?.trim() || !isMarkdownPaste(text)) return false;

          const inst = editorRefForPaste.current;
          if (!inst) return false;

          event.preventDefault();
          applyMarkdownImport(text, inst);
          return true;
        },
      },
    });

    useEffect(() => {
      editorRefForPaste.current = editor;
    }, [editor]);

    useImperativeHandle(ref, () => ({
      editor,
    }));

    useEffect(() => {
      if (!editor) return;

      if (initialContent) {
        editor.commands.setContent(initialContent);
      } else {
        const savedContent = loadContent(workspaceSlug);
        if (savedContent) {
          editor.commands.setContent(savedContent);
        } else {
          editor.commands.setContent('<p></p>');
        }
      }

      setTimeout(() => {
        editor.commands.focus();
      }, 0);
    }, [workspaceSlug, editor, initialContent]);

    const dropZoneRef = useRef<HTMLDivElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
      if (!isMarkdownDrop(e.nativeEvent)) return;
      e.preventDefault();
      dragCounterRef.current += 1;
      setIsDraggingOver(true);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      if (!isMarkdownDrop(e.nativeEvent)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      if (!isMarkdownDrop(e.nativeEvent)) return;
      const related = e.relatedTarget as Node | null;
      if (related && dropZoneRef.current?.contains(related)) return;
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current === 0) setIsDraggingOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        if (!isMarkdownDrop(e.nativeEvent)) return;
        e.preventDefault();
        dragCounterRef.current = 0;
        setIsDraggingOver(false);

        const files = e.dataTransfer?.files;
        if (files?.length) {
          const mdFile = Array.from(files).find((f) =>
            f.name.toLowerCase().endsWith('.md'),
          );
          if (!mdFile || !editor) return;

          const reader = new FileReader();
          reader.onload = () => {
            const raw = String(reader.result ?? '');
            if (raw.trim()) applyMarkdownImport(raw, editor);
          };
          reader.readAsText(mdFile);
          return;
        }

        const text = e.dataTransfer?.getData('text/plain');
        if (text?.trim() && editor) {
          applyMarkdownImport(text, editor);
        }
      },
      [editor, applyMarkdownImport],
    );

    if (!editor) {
      return null;
    }

    return (
      <div className='h-full w-full bg-background text-foreground border border-foreground/5 rounded-lg overflow-hidden flex flex-col relative'>
        <Toolbar editor={editor} />
        <div
          ref={dropZoneRef}
          className='flex-1 min-h-0 overflow-hidden border-t border-foreground/5 relative'
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDraggingOver && (
            <div className='absolute inset-0 z-10 flex items-center justify-center bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg m-2'>
              <p className='text-sm font-medium text-primary'>
                Drop markdown to import
              </p>
            </div>
          )}
          <ScrollArea className='h-full [&_[data-slot=scroll-area-thumb]]:bg-foreground/20 [&_[data-slot=scroll-area-scrollbar]]:border-l-0'>
            <div
              className='p-4 min-h-[max(14rem,100%)] max-w-full overflow-x-hidden cursor-text'
              onClick={() => editor.commands.focus()}
              role='button'
              tabIndex={-1}
              aria-label='Focus editor'
            >
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
