import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className='relative'>
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive md:text-sm',
            'pr-10',
            className,
          )}
          ref={ref}
          {...props}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
          onClick={() => setShowPassword(!showPassword)}
          disabled={props.disabled}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff
              className='h-4 w-4 text-muted-foreground transition-opacity duration-200'
              aria-hidden='true'
            />
          ) : (
            <Eye
              className='h-4 w-4 text-muted-foreground transition-opacity duration-200'
              aria-hidden='true'
            />
          )}
          <span className='sr-only'>
            {showPassword ? 'Hide password' : 'Show password'}
          </span>
        </Button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
