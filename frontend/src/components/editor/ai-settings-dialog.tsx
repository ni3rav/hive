import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Eye, EyeOff, ExternalLink, CheckCircle2 } from 'lucide-react';

const AI_API_KEY_STORAGE_KEY = 'hive_ai_api_key';

export function AISettingsDialog() {
    const [open, setOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Load saved API key from localStorage
        const savedKey = localStorage.getItem(AI_API_KEY_STORAGE_KEY);
        if (savedKey) {
            setApiKey(savedKey);
            setIsSaved(true);
        }
    }, []);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem(AI_API_KEY_STORAGE_KEY, apiKey.trim());
            setIsSaved(true);
            setTimeout(() => {
                setOpen(false);
            }, 500);
        }
    };

    const handleClear = () => {
        localStorage.removeItem(AI_API_KEY_STORAGE_KEY);
        setApiKey('');
        setIsSaved(false);
    };

    const maskApiKey = (key: string) => {
        if (key.length <= 8) return key;
        return `${key.slice(0, 4)}${'•'.repeat(key.length - 8)}${key.slice(-4)}`;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2">
                    <Settings className="h-4 w-4" />
                    AI Settings
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>AI Settings</DialogTitle>
                    <DialogDescription>
                        Configure your AI API key to enable AI-powered features. Your key is stored locally and never sent to our servers.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">OpenAI API Key</Label>
                        <div className="relative">
                            <Input
                                id="api-key"
                                type={showKey ? 'text' : 'password'}
                                placeholder="sk-..."
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setIsSaved(false);
                                }}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
                            >
                                {showKey ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your API key is stored securely in your browser's local storage.
                        </p>
                    </div>

                    {isSaved && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>API key saved successfully</span>
                        </div>
                    )}

                    <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                        <h4 className="text-sm font-medium">How to get an API key:</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Visit OpenAI's platform</li>
                            <li>Sign up or log in to your account</li>
                            <li>Navigate to API keys section</li>
                            <li>Create a new secret key</li>
                            <li>Copy and paste it here</li>
                        </ol>
                        <a
                            href="https://platform.openai.com/api-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            Get your API key
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    {apiKey && (
                        <div className="rounded-lg border border-border bg-muted/30 p-3">
                            <p className="text-xs font-medium mb-1">Current Key:</p>
                            <p className="text-sm font-mono text-muted-foreground">
                                {showKey ? apiKey : maskApiKey(apiKey)}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    {apiKey && (
                        <Button variant="outline" onClick={handleClear}>
                            Clear Key
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={!apiKey.trim()}>
                        Save Settings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
