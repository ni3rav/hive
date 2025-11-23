import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className='h-4 w-4' />;
    }
    if (theme === 'dark') {
      return <Moon className='h-4 w-4' />;
    }
    return <Sun className='h-4 w-4' />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={cn('h-9 w-9', className)}
          aria-label='Toggle theme'
        >
          {getIcon()}
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-[160px] p-1.5'>
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'cursor-pointer gap-3 px-3 py-2.5',
            theme === 'light' && 'bg-accent text-accent-foreground',
          )}
        >
          <Sun className='h-4 w-4' />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'cursor-pointer gap-3 px-3 py-2.5',
            theme === 'dark' && 'bg-accent text-accent-foreground',
          )}
        >
          <Moon className='h-4 w-4' />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            'cursor-pointer gap-3 px-3 py-2.5',
            theme === 'system' && 'bg-accent text-accent-foreground',
          )}
        >
          <Monitor className='h-4 w-4' />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

