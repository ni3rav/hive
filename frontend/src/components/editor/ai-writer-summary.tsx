import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AIWriterSummaryProps {
    editorText: string;
    wordCount: number;
}

interface MockSummaryData {
    readabilityScore: number;
    tone: string;
    keyPoints: string[];
    suggestions: string[];
    seoScore: number;
}

export function AIWriterSummary({ editorText, wordCount }: AIWriterSummaryProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState<MockSummaryData | null>(null);
    const [expandedSections, setExpandedSections] = useState({
        keyPoints: true,
        suggestions: true,
    });

    const generateMockSummary = () => {
        setIsGenerating(true);

        // Simulate API call delay
        setTimeout(() => {
            const mockData: MockSummaryData = {
                readabilityScore: Math.floor(Math.random() * 30) + 70, // 70-100
                tone: ['Professional', 'Casual', 'Informative', 'Persuasive'][Math.floor(Math.random() * 4)],
                keyPoints: [
                    'Clear introduction that hooks the reader',
                    'Well-structured main arguments with supporting evidence',
                    'Effective use of examples and analogies',
                    wordCount > 500 ? 'Comprehensive coverage of the topic' : 'Concise and focused content',
                ],
                suggestions: [
                    wordCount < 300 ? 'Consider expanding key sections for better depth' : 'Content length is appropriate for the topic',
                    'Add more transition words for better flow',
                    'Include a call-to-action in the conclusion',
                    'Consider adding relevant statistics or data',
                ],
                seoScore: Math.floor(Math.random() * 25) + 75, // 75-100
            };

            setSummary(mockData);
            setIsGenerating(false);
        }, 1500);
    };

    const toggleSection = (section: 'keyPoints' | 'suggestions') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 75) return 'text-blue-600 dark:text-blue-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
        if (score >= 90) return 'default';
        if (score >= 75) return 'secondary';
        return 'outline';
    };

    const hasContent = editorText.trim().length > 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">
                        AI Writer Summary
                    </h3>
                </div>
                {!summary && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={generateMockSummary}
                        disabled={isGenerating || !hasContent}
                        className="h-7 text-xs"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-1.5 h-3 w-3" />
                                Generate
                            </>
                        )}
                    </Button>
                )}
            </div>

            {!hasContent && !summary && (
                <p className="text-sm text-muted-foreground">
                    Start writing to get AI-powered insights about your content.
                </p>
            )}

            {summary && (
                <div className="space-y-4">
                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <div className="text-xs text-muted-foreground">Readability</div>
                            <div className="flex items-center gap-2">
                                <span className={cn('text-2xl font-bold', getScoreColor(summary.readabilityScore))}>
                                    {summary.readabilityScore}
                                </span>
                                <span className="text-xs text-muted-foreground">/100</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="text-xs text-muted-foreground">SEO Score</div>
                            <div className="flex items-center gap-2">
                                <span className={cn('text-2xl font-bold', getScoreColor(summary.seoScore))}>
                                    {summary.seoScore}
                                </span>
                                <span className="text-xs text-muted-foreground">/100</span>
                            </div>
                        </div>
                    </div>

                    {/* Tone */}
                    <div className="space-y-1.5">
                        <div className="text-xs text-muted-foreground">Detected Tone</div>
                        <Badge variant={getScoreBadgeVariant(summary.readabilityScore)}>
                            {summary.tone}
                        </Badge>
                    </div>

                    {/* Key Points */}
                    <div className="space-y-2">
                        <button
                            onClick={() => toggleSection('keyPoints')}
                            className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                            <span>Key Strengths</span>
                            {expandedSections.keyPoints ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                        {expandedSections.keyPoints && (
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {summary.keyPoints.map((point, index) => (
                                    <li key={index} className="flex gap-2">
                                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                        <button
                            onClick={() => toggleSection('suggestions')}
                            className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                            <span>Suggestions for Improvement</span>
                            {expandedSections.suggestions ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                        {expandedSections.suggestions && (
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {summary.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400 mt-0.5">→</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Regenerate button */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={generateMockSummary}
                        disabled={isGenerating}
                        className="w-full h-8 text-xs"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                Regenerating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-1.5 h-3 w-3" />
                                Regenerate Summary
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
