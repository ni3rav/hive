import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { KeyRound } from 'lucide-react';

interface ProfileSettingsListProps {
  aiStatusText: string;
  onOpenAiSettings: () => void;
}

export function ProfileSettingsList({
  aiStatusText,
  onOpenAiSettings,
}: ProfileSettingsListProps) {
  return (
    <div className='rounded-md border border-foreground/10 bg-card/30 p-1'>
      <div className='px-5 py-4'>
        <p className='text-sm font-medium text-muted-foreground'>
          Account settings
        </p>
      </div>
      <Separator className='bg-accent/50' />
      <div className='flex items-center justify-between gap-4 px-5 py-4'>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>AI integration</p>
          <p className='text-sm text-muted-foreground'>
            Configure your Gemini BYOK key for editor AI actions.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-muted-foreground'>{aiStatusText}</span>
          <Button size='sm' onClick={onOpenAiSettings}>
            <KeyRound className='mr-2 h-4 w-4' />
            Manage AI
          </Button>
        </div>
      </div>
    </div>
  );
}
