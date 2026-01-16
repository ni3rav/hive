import { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Loader2, Sparkles, Wand2, Minimize2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIEditorToolsProps {
    editor: Editor;
}

type ToneOption = 'professional' | 'casual' | 'friendly' | 'formal';

export function AIEditorTools({ editor }: AIEditorToolsProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const getSelectedText = () => {
        const { from, to } = editor.state.selection;
        return editor.state.doc.textBetween(from, to, ' ');
    };

    const replaceSelectedText = (newText: string) => {
        const { from, to } = editor.state.selection;
        editor.chain().focus().deleteRange({ from, to }).insertContent(newText).run();
    };

    const mockTransformText = (
        text: string,
        action: 'tone' | 'shorten' | 'grammar',
        tone?: ToneOption
    ): string => {
        // Mock transformations - in real implementation, this would call an AI API
        switch (action) {
            case 'tone':
                if (tone === 'professional') {
                    return text
                        .replace(/gonna/gi, 'going to')
                        .replace(/wanna/gi, 'want to')
                        .replace(/kinda/gi, 'kind of')
                        .replace(/!/g, '.');
                } else if (tone === 'casual') {
                    return text
                        .replace(/going to/gi, 'gonna')
                        .replace(/want to/gi, 'wanna')
                        .replace(/\. /g, '! ');
                } else if (tone === 'friendly') {
                    return `${text} 😊`;
                } else if (tone === 'formal') {
                    return text
                        .replace(/don't/gi, 'do not')
                        .replace(/can't/gi, 'cannot')
                        .replace(/won't/gi, 'will not')
                        .replace(/!/g, '.');
                }
                return text;

            case 'shorten':
                // Mock shortening by removing some words
                const words = text.split(' ');
                if (words.length <= 5) return text;
                return words.slice(0, Math.ceil(words.length * 0.7)).join(' ') + '...';

            case 'grammar':
                // Mock grammar fixes
                return text
                    .replace(/\bi\b/g, 'I')
                    .replace(/\s+/g, ' ')
                    .replace(/\s([.,!?])/g, '$1')
                    .trim();

            default:
                return text;
        }
    };

    const handleChangeTone = (tone: ToneOption) => {
        const selectedText = getSelectedText();
        if (!selectedText) return;

        setIsProcessing(true);

        setTimeout(() => {
            const transformedText = mockTransformText(selectedText, 'tone', tone);
            replaceSelectedText(transformedText);
            setIsProcessing(false);
        }, 1000);
    };

    const handleShorten = () => {
        const selectedText = getSelectedText();
        if (!selectedText) return;

        setIsProcessing(true);

        setTimeout(() => {
            const transformedText = mockTransformText(selectedText, 'shorten');
            replaceSelectedText(transformedText);
            setIsProcessing(false);
        }, 1000);
    };

    const handleFixGrammar = () => {
        const selectedText = getSelectedText();
        if (!selectedText) return;

        setIsProcessing(true);

        setTimeout(() => {
            const transformedText = mockTransformText(selectedText, 'grammar');
            replaceSelectedText(transformedText);
            setIsProcessing(false);
        }, 1000);
    };

    const hasSelection = !editor.state.selection.empty;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    title="AI Tools"
                    disabled={!hasSelection || isProcessing}
                    className={cn(
                        'p-2 rounded hover:bg-muted transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Tools
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Change Tone submenu */}
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Change Tone
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleChangeTone('professional')}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Professional
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeTone('casual')}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Casual
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeTone('friendly')}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Friendly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeTone('formal')}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Formal
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Other AI actions */}
                <DropdownMenuItem onClick={handleShorten}>
                    <Minimize2 className="mr-2 h-4 w-4" />
                    Shorten Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFixGrammar}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Fix Grammar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
