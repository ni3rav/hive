import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck } from 'lucide-react';

interface AISettingsPanelProps {
  geminiApiKey: string;
  model: string;
  statusText: string;
  isSaving: boolean;
  isRemoving: boolean;
  hasKey: boolean;
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSave: () => void;
  onRemove: () => void;
}

export function AISettingsPanel({
  geminiApiKey,
  model,
  statusText,
  isSaving,
  isRemoving,
  hasKey,
  onApiKeyChange,
  onModelChange,
  onSave,
  onRemove,
}: AISettingsPanelProps) {
  return (
    <>
      <div className='rounded-lg border border-dashed border-foreground/10 bg-muted/40 p-4'>
        <div className='flex gap-3'>
          <ShieldCheck className='mt-0.5 h-4 w-4 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>
            Your Gemini key is stored encrypted on the server and never shown in
            full after saving.
          </p>
        </div>
      </div>

      <div className='rounded-md border border-foreground/10 bg-card/30 p-1'>
        <div className='px-5 py-4'>
          <p className='text-sm font-medium text-muted-foreground'>Gemini BYOK</p>
        </div>
        <Separator className='bg-accent/50' />
        <div className='space-y-4 px-5 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='gemini-api-key'>Gemini API Key</Label>
            <Input
              id='gemini-api-key'
              type='password'
              placeholder='Paste your Gemini API key'
              value={geminiApiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='gemini-model'>Model (optional)</Label>
            <Input
              id='gemini-model'
              type='text'
              placeholder='gemini-2.5-flash'
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
            />
          </div>

          <div className='text-xs text-muted-foreground'>Status: {statusText}</div>

          <div className='flex gap-2'>
            <Button
              type='button'
              size='sm'
              onClick={onSave}
              disabled={isSaving || geminiApiKey.trim().length === 0}
            >
              {isSaving ? 'Saving...' : 'Save key'}
            </Button>

            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={onRemove}
              disabled={isRemoving || !hasKey}
            >
              {isRemoving ? 'Removing...' : 'Remove key'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
