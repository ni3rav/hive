import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AITagSuggesterProps {
    editorText: string;
    currentTags: string[];
    onAddTag: (tagSlug: string) => void;
}

export function AITagSuggester({ editorText, currentTags, onAddTag }: AITagSuggesterProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const [dismissedTags, setDismissedTags] = useState<Set<string>>(new Set());

    const generateMockTags = () => {
        setIsGenerating(true);

        // Simulate API call delay
        setTimeout(() => {
            // Mock tag suggestions based on content length and existing tags
            const allPossibleTags = [
                'technology',
                'web-development',
                'javascript',
                'react',
                'tutorial',
                'best-practices',
                'reactjs',
                'typescript',
                'nodejs',
                'frontend-development',
                'coding',
                'programming',
                'web-design',
                'html',
                'css',
                'es6',
                'jsx',
                'hooks',
                'components',
                'state-management',
                'redux',
                'nextjs',
                'vite',
                'webpack',
                'responsive-design',
                'ui-components',
                'api-integration',
                'rest-api',
                'async-programming',
                'debugging',
                'code-optimization',
                'clean-code',
            ];

            // Filter out current tags and dismissed tags
            const availableTags = allPossibleTags.filter(
                tag => !currentTags.includes(tag) && !dismissedTags.has(tag)
            );

            // Randomly select 4-6 tags
            const numTags = Math.floor(Math.random() * 3) + 4; // 4-6 tags
            const shuffled = availableTags.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(numTags, availableTags.length));

            setSuggestedTags(selected);
            setIsGenerating(false);
        }, 1200);
    };

    const handleAddTag = (tag: string) => {
        onAddTag(tag);
        setSuggestedTags(prev => prev.filter(t => t !== tag));
    };

    const handleDismissTag = (tag: string) => {
        setDismissedTags(prev => new Set([...prev, tag]));
        setSuggestedTags(prev => prev.filter(t => t !== tag));
    };

    const handleDismissAll = () => {
        setDismissedTags(prev => new Set([...prev, ...suggestedTags]));
        setSuggestedTags([]);
    };

    const hasContent = editorText.trim().length > 50; // Need at least 50 chars for meaningful suggestions

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={generateMockTags}
                    disabled={isGenerating || !hasContent}
                    className="h-8 text-xs"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-1.5 h-3 w-3" />
                            Suggest Tags with AI
                        </>
                    )}
                </Button>
            </div>

            {!hasContent && suggestedTags.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    Write at least 50 characters to get AI tag suggestions.
                </p>
            )}

            {suggestedTags.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">
                            Suggested Tags
                        </p>
                        <button
                            onClick={handleDismissAll}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Dismiss all
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestedTags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="group relative pr-8 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handleAddTag(tag)}
                            >
                                <span>{tag}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDismissTag(tag);
                                    }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-sm opacity-60 hover:opacity-100 transition-opacity"
                                    title="Dismiss this suggestion"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Click a tag to add it to your post
                    </p>
                </div>
            )}
        </div>
    );
}
