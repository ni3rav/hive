import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIDescriptionGeneratorProps {
    editorText: string;
    currentExcerpt: string;
    onSelectDescription: (description: string) => void;
}

export function AIDescriptionGenerator({
    editorText,
    currentExcerpt,
    onSelectDescription,
}: AIDescriptionGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [descriptions, setDescriptions] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const generateMockDescriptions = () => {
        setIsGenerating(true);

        // Simulate API call delay
        setTimeout(() => {
            const wordCount = editorText.trim().split(/\s+/).length;

            // Generate 3 different style descriptions
            const mockDescriptions = [
                // Concise version
                `A comprehensive guide covering the essential aspects of the topic. Perfect for readers looking to understand the fundamentals and key takeaways.`,

                // Engaging version
                `Discover the insights and practical tips that will transform your understanding. This article breaks down complex concepts into actionable advice you can use today.`,

                // SEO-optimized version
                `Learn everything you need to know about this important topic. This detailed ${wordCount > 500 ? 'in-depth' : 'focused'} article provides expert insights, real-world examples, and proven strategies.`,
            ];

            setDescriptions(mockDescriptions);
            setSelectedIndex(null);
            setIsGenerating(false);
        }, 1500);
    };

    const handleSelectDescription = (index: number) => {
        setSelectedIndex(index);
        onSelectDescription(descriptions[index]);
    };

    const hasContent = editorText.trim().length > 100; // Need meaningful content

    return (
        <div className="space-y-3">
            <Button
                size="sm"
                variant="outline"
                onClick={generateMockDescriptions}
                disabled={isGenerating || !hasContent}
                className="h-8 text-xs w-full"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-1.5 h-3 w-3" />
                        Generate Description with AI
                    </>
                )}
            </Button>

            {!hasContent && descriptions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    Write at least 100 characters to generate AI descriptions.
                </p>
            )}

            {descriptions.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">
                            Choose a description:
                        </p>
                        <button
                            onClick={generateMockDescriptions}
                            disabled={isGenerating}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            <RefreshCw className={cn('h-3 w-3', isGenerating && 'animate-spin')} />
                            Regenerate
                        </button>
                    </div>

                    <div className="space-y-2">
                        {descriptions.map((desc, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectDescription(index)}
                                className={cn(
                                    'w-full text-left p-3 rounded-lg border text-sm transition-all',
                                    selectedIndex === index
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                )}
                            >
                                <div className="flex items-start gap-2">
                                    <div
                                        className={cn(
                                            'mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                                            selectedIndex === index
                                                ? 'border-primary bg-primary'
                                                : 'border-muted-foreground'
                                        )}
                                    >
                                        {selectedIndex === index && (
                                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                            Option {index + 1}
                                        </p>
                                        <p className="text-foreground leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedIndex !== null && (
                        <p className="text-xs text-muted-foreground">
                            ✓ Description selected and applied
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
