import { useEditor, EditorContent } from '@tiptap/react';
import {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
  useRef,
} from 'react';
import type { Editor } from '@tiptap/react';
import { loadContent, saveContent } from './persistence';
import type { ProseMirrorJSON } from './persistence';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toolbar } from './Toolbar';
import { getEditorExtensions } from './extensions';
import { EditorBubbleMenu } from './BubbleMenu';
import { EditorFloatingMenu } from './FloatingMenu';
import { useEditorContext } from '@/components/editor/editor-context';
import {
  parseMarkdown,
  markdownToProseMirrorJSON,
} from '@/lib/markdown-import';
import { isEditorEmpty } from '@/components/editor/content-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';
import './tiptap.css';

const IMAGE_WARNING =
  'Images in markdown are not supported. Raw text inserted—add images manually.';

function isMarkdownDrop(event: DragEvent): boolean {
  const types = event.dataTransfer?.types;
  if (!types) return false;
  if (types.includes('Files')) return true;
  return types.includes('text/plain');
}

function isMarkdownPaste(text: string): boolean {
  const t = text.trim();
  return (
    t.length > 0 &&
    (t.startsWith('---') || /^#+\s/m.test(t) || /^[-*]\s/m.test(t))
  );
}

interface TiptapProps {
  workspaceSlug?: string;
  initialContent?: ProseMirrorJSON | null;
  initialMarkdownImport?: string;
  disablePersistence?: boolean;
}

export interface TiptapHandle {
  editor: Editor | null;
}

export const Tiptap = forwardRef<TiptapHandle, TiptapProps>(
  (
    {
      workspaceSlug,
      initialContent,
      initialMarkdownImport,
      disablePersistence = false,
    },
    ref,
  ) => {
    const { setMetadata } = useEditorContext();
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [pendingImport, setPendingImport] = useState<string | null>(null);
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

    const editorRefForDrop = useRef<Editor | null>(null);

    const requestMarkdownImport = useCallback(
      (raw: string, editorInstance: Editor) => {
        const { hasImages } = parseMarkdown(raw);
        if (hasImages) {
          applyMarkdownImport(raw, editorInstance);
          return;
        }
        if (isEditorEmpty(editorInstance)) {
          applyMarkdownImport(raw, editorInstance);
          return;
        }
        setPendingImport(raw);
      },
      [applyMarkdownImport],
    );

    const confirmOverwriteImport = useCallback(() => {
      if (!pendingImport) return;
      const inst = editorRefForDrop.current ?? editorRefForPaste.current;
      if (!inst) return;
      applyMarkdownImport(pendingImport, inst);
      setPendingImport(null);
    }, [pendingImport, applyMarkdownImport]);

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
        handleDrop: (_view, event) => {
          if (!isMarkdownDrop(event)) return false;
          event.preventDefault();
          event.stopPropagation();
          const inst = editorRefForDrop.current;
          if (!inst) return false;

          const files = event.dataTransfer?.files;
          if (files?.length) {
            const mdFile = Array.from(files).find((f) =>
              f.name.toLowerCase().endsWith('.md'),
            );
            if (!mdFile) return false;
            const reader = new FileReader();
            reader.onload = () => {
              const raw = String(reader.result ?? '');
              if (raw.trim()) requestMarkdownImport(raw, inst);
            };
            reader.readAsText(mdFile);
            return true;
          }

          const text = event.dataTransfer?.getData('text/plain');
          if (text?.trim()) {
            requestMarkdownImport(text, inst);
            return true;
          }
          return false;
        },
        handlePaste: (_view, event) => {
          const text = event.clipboardData?.getData('text/plain');
          if (!text?.trim() || !isMarkdownPaste(text)) return false;

          const inst = editorRefForPaste.current;
          if (!inst) return false;

          event.preventDefault();
          requestMarkdownImport(text, inst);
          return true;
        },
      },
    });

    useEffect(() => {
      editorRefForPaste.current = editor;
      editorRefForDrop.current = editor;
    }, [editor]);

    useImperativeHandle(ref, () => ({
      editor,
    }));

    const hasInitializedRef = useRef(false);
    useEffect(() => {
      if (!editor || hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      if (initialMarkdownImport) {
        applyMarkdownImport(initialMarkdownImport, editor);
      } else if (initialContent) {
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
    }, [
      workspaceSlug,
      editor,
      initialContent,
      initialMarkdownImport,
      applyMarkdownImport,
    ]);

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
            if (raw.trim()) requestMarkdownImport(raw, editor);
          };
          reader.readAsText(mdFile);
          return;
        }

        const text = e.dataTransfer?.getData('text/plain');
        if (text?.trim() && editor) {
          requestMarkdownImport(text, editor);
        }
      },
      [editor, requestMarkdownImport],
    );

    if (!editor) {
      return null;
    }

    return (
      <div
        ref={dropZoneRef}
        className='h-full w-full bg-background text-foreground border border-foreground/5 rounded-lg overflow-hidden flex flex-col relative'
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Toolbar editor={editor} />
        <div className='flex-1 min-h-0 overflow-hidden border-t border-foreground/5 relative'>
          {isDraggingOver && (
            <div className='absolute inset-0 z-[100] flex items-center justify-center border-2 border-dashed border-primary bg-primary/20 backdrop-blur-md ring-4 ring-primary/20 ring-inset'>
              <div className='flex flex-col items-center gap-3 rounded-xl bg-background/90 px-10 py-8 shadow-lg ring-1 ring-primary/30'>
                <div className='rounded-full bg-primary/30 p-4 ring-2 ring-primary/50'>
                  <FileDown
                    className='h-10 w-10 text-primary'
                    strokeWidth={2}
                  />
                </div>
                <p className='text-lg font-semibold text-foreground'>
                  Drop markdown to import
                </p>
                <p className='text-sm text-muted-foreground'>
                  .md files or markdown text
                </p>
              </div>
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

        <Dialog
          open={!!pendingImport}
          onOpenChange={(open) => !open && setPendingImport(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Overwrite content?</DialogTitle>
              <DialogDescription>
                The editor already has content. Importing markdown will replace
                everything. Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className='sm:justify-start'>
              <Button variant='outline' onClick={() => setPendingImport(null)}>
                Cancel
              </Button>
              <Button variant='destructive' onClick={confirmOverwriteImport}>
                Overwrite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

Tiptap.displayName = 'Tiptap';
