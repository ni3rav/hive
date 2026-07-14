import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { DOMSerializer } from '@tiptap/pm/model';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAIProvider } from '@/hooks/useAIProvider';
import { useSelectionTransform } from '@/hooks/useSelectionTransform';
import type { TransformSelectionAction } from '@/types/ai';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const TONE_OPTIONS = ['professional', 'casual', 'friendly', 'formal'] as const;
const REWRITE_PLACEHOLDER = 'Content is being rewritten...';
const STRUCTURED_HTML_REGEX =
  /<\/?(h[1-6]|p|ul|ol|li|blockquote|pre|code|table|thead|tbody|tr|th|td)\b/i;

interface AISelectionControlsProps {
  editor: Editor;
  buttonClassName?: string;
}

const ACTION_LABELS: Record<TransformSelectionAction, string> = {
  change_tone: 'Change tone',
  fix_grammar: 'Fix grammar',
  elaborate: 'Elaborate',
  concise: 'Concise',
};

export function AISelectionControls({
  editor,
  buttonClassName,
}: AISelectionControlsProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [tone, setTone] = useState<(typeof TONE_OPTIONS)[number]>('professional');
  const [pendingAction, setPendingAction] =
    useState<TransformSelectionAction | null>(null);
  const [previewResult, setPreviewResult] = useState('');
  const { data: aiProvider, isLoading: isAiProviderLoading } = useAIProvider();
  const transformMutation = useSelectionTransform();

  const { from, to, empty } = editor.state.selection;
  const selectedText = empty
    ? ''
    : editor.state.doc.textBetween(from, to, ' ').trim();

  const hasSelection = selectedText.length > 0;
  const hasAiKey = Boolean(aiProvider?.hasKey);
  const isBusy = isAiProviderLoading || transformMutation.isPending;

  const runTransform = async (
    action: TransformSelectionAction,
    selectedTone?: string,
  ) => {
    if (!hasAiKey) {
      toast.error('Configure Gemini key first');
      navigate('/profile?ai');
      return;
    }

    const { from, to, empty } = editor.state.selection;
    if (empty) {
      toast.error('Select text to use AI actions');
      return;
    }

    const selectedContent = editor.state.doc.textBetween(from, to, ' ');
    const normalizedSelection = selectedContent.trim();
    if (!normalizedSelection) {
      toast.error('Select text to use AI actions');
      return;
    }

    const selectionFragment = editor.state.selection.content().content;
    const serializer = DOMSerializer.fromSchema(editor.schema);
    const container = document.createElement('div');
    container.appendChild(serializer.serializeFragment(selectionFragment));
    const selectedHtml = container.innerHTML.trim();

    const preserveStructure = STRUCTURED_HTML_REGEX.test(selectedHtml);
    const selectionPayload =
      preserveStructure && selectedHtml ? selectedHtml : normalizedSelection;
    const useInlinePlaceholder = !preserveStructure;

    const placeholderFrom = from;
    const placeholderTo = from + REWRITE_PLACEHOLDER.length;

    if (useInlinePlaceholder) {
      editor
        .chain()
        .focus()
        .insertContentAt({ from, to }, REWRITE_PLACEHOLDER)
        .run();
    }

    setPreviewResult('');
    setPendingAction(action);

    try {
      const response = await transformMutation.mutateAsync({
        selection: selectionPayload,
        action,
        tone: selectedTone,
      });

      setPreviewResult(response.transformed);
      if (useInlinePlaceholder) {
        editor
          .chain()
          .focus()
          .insertContentAt(
            { from: placeholderFrom, to: placeholderTo },
            response.transformed,
          )
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, response.transformed)
          .run();
      }

      setTimeout(() => {
        setIsOpen(false);
      }, 250);
    } catch {
      if (useInlinePlaceholder) {
        editor
          .chain()
          .focus()
          .insertContentAt(
            { from: placeholderFrom, to: placeholderTo },
            selectedContent,
          )
          .run();
      }
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          title='AI rewrite tools'
          onMouseDown={(event) => event.preventDefault()}
          className={cn(
            'flex size-8 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-foreground/10',
            isOpen && 'bg-foreground/10 text-primary',
            buttonClassName,
          )}
        >
          <Sparkles className='h-4 w-4' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-[360px] space-y-3' align='start'>
        <div>
          <h4 className='text-sm font-semibold'>AI rewrite</h4>
          <p className='text-xs text-muted-foreground mt-1'>
            Apply quick edits to selected text only.
          </p>
        </div>

        <Separator />

        {!hasSelection && (
          <p className='text-xs text-muted-foreground'>
            Select some text in the editor to enable AI actions.
          </p>
        )}

        {hasSelection && (
          <>
            <div className='space-y-2'>
              <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>
                Selected text
              </p>
              <div className='rounded-md border border-foreground/10 bg-muted/20 p-2'>
                <p className='text-xs text-foreground line-clamp-3'>{selectedText}</p>
              </div>
            </div>

            <div className='rounded-md border border-foreground/10 bg-muted/20 p-2'>
              <p className='text-[11px] uppercase tracking-wide text-muted-foreground mb-2'>
                Rewrite actions
              </p>
              <div className='grid grid-cols-3 gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='h-8'
                  disabled={isBusy}
                  onClick={() => runTransform('fix_grammar')}
                >
                  Fix grammar
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='h-8'
                  disabled={isBusy}
                  onClick={() => runTransform('elaborate')}
                >
                  Elaborate
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='h-8'
                  onClick={() => runTransform('concise')}
                  disabled={isBusy}
                >
                  Concise
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>
                Tone
              </p>
              <div className='grid grid-cols-3 gap-2'>
                <div className='col-span-2'>
                  <Select
                    value={tone}
                    onValueChange={(value) =>
                      setTone(value as (typeof TONE_OPTIONS)[number])
                    }
                    disabled={isBusy}
                  >
                    <SelectTrigger size='sm' className='h-8 w-full'>
                      <SelectValue placeholder='Tone' />
                    </SelectTrigger>
                    <SelectContent align='start'>
                      {TONE_OPTIONS.map((toneOption) => (
                        <SelectItem key={toneOption} value={toneOption}>
                          {toneOption[0].toUpperCase() + toneOption.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='h-8'
                  disabled={isBusy}
                  onClick={() => runTransform('change_tone', tone)}
                >
                  Apply tone
                </Button>
              </div>
            </div>
          </>
        )}

        {!hasAiKey && !isAiProviderLoading && (
          <div className='rounded-md border border-dashed border-foreground/20 bg-muted/30 p-3'>
            <p className='text-xs text-muted-foreground'>
              Configure your Gemini key to use AI rewrites.
            </p>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='mt-2'
              onClick={() => navigate('/profile?ai')}
            >
              Configure AI
            </Button>
          </div>
        )}

        {transformMutation.isPending && pendingAction && (
          <div className='rounded-md border border-primary/30 bg-primary/5 p-3 space-y-2'>
            <p className='text-[11px] uppercase tracking-wide text-primary/80'>
              Rewriting
            </p>
            <div className='flex items-center gap-2 text-primary'>
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
              <span className='text-xs font-medium'>
                {ACTION_LABELS[pendingAction]} in progress...
              </span>
            </div>
            <p className='text-xs text-muted-foreground line-clamp-3'>
              Content is being rewritten...
            </p>
          </div>
        )}

        {!transformMutation.isPending && previewResult && (
          <div className='rounded-md border border-foreground/10 bg-muted/20 p-3 space-y-1'>
            <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>
              Applied preview
            </p>
            <p className='text-xs text-foreground line-clamp-4'>{previewResult}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
