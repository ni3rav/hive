import * as React from 'react';
import { Check, ChevronsUpDown, Settings } from 'lucide-react'; // Changed Plus to Settings
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useWorkspaceAuthors } from '@/hooks/useAuthor';
import type { Author } from '@/types/author';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthorSelectProps {
  value: string | null;
  onChange: (authorId: string | null, author?: Author | null) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export default function AuthorSelect({
  value,
  onChange,
  placeholder = 'Select author...',
  allowCreate = true,
}: AuthorSelectProps) {
  const navigate = useNavigate();
  const { data: authors = [], isLoading } = useWorkspaceAuthors() as {
    data: Author[];
    isLoading: boolean;
  };
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(
    () => authors.find((a) => a.id === value) ?? null,
    [authors, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
        >
          {isLoading ? (
            <Skeleton className='h-5 w-40' />
          ) : (
            <span
              className={cn('truncate', !selected && 'text-muted-foreground')}
            >
              {selected ? selected.name : placeholder}
            </span>
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[--radix-popover-trigger-width] p-0'
        align='start'
      >
        <Command>
          <CommandInput placeholder='Search authors...' />
          <CommandList>
            {isLoading ? (
              <div className='space-y-2 p-3'>
                <Skeleton className='h-5 w-full' />
                <Skeleton className='h-5 w-[90%]' />
                <Skeleton className='h-5 w-[80%]' />
              </div>
            ) : (
              <CommandEmpty>No authors found.</CommandEmpty>
            )}
            <CommandGroup heading='Authors'>
              {isLoading ? (
                <div className='space-y-2 p-3'>
                  <Skeleton className='h-5 w-full' />
                  <Skeleton className='h-5 w-[95%]' />
                  <Skeleton className='h-5 w-[90%]' />
                </div>
              ) : (
                (authors as Author[]).map((author) => (
                  <CommandItem
                    key={author.id}
                    value={author.name}
                    onSelect={() => {
                      onChange(author.id!, author);
                      setOpen(false);
                    }}
                    className='cursor-pointer'
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === author.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className='truncate'>{author.name}</div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
            {allowCreate && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    // --- CHANGE: Navigate to the authors management page ---
                    navigate('/dashboard/authors');
                  }}
                  className='cursor-pointer text-primary'
                >
                  {/* --- CHANGE: Updated icon and text --- */}
                  <Settings className='mr-2 h-4 w-4' />
                  Manage authors
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
