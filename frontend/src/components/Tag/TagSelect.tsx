import * as React from 'react';
import { Check, ChevronsUpDown, Settings } from 'lucide-react';
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
import { useWorkspaceTags } from '@/hooks/useTag';
import type { Tag } from '@/types/tag';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';

interface TagSelectProps {
  value: string | null;
  onChange: (tagSlug: string | null, tag?: Tag | null) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export default function TagSelect({
  value,
  onChange,
  placeholder = 'Select tag...',
  allowCreate = true,
}: TagSelectProps) {
  const navigate = useNavigate();
  const workspaceSlug = useWorkspaceSlug();
  const { data: tags = [], isLoading } = useWorkspaceTags(workspaceSlug!) as {
    data: Tag[];
    isLoading: boolean;
  };
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(
    () => tags.find((t) => t.slug === value) ?? null,
    [tags, value],
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
          <CommandInput placeholder='Search tags...' />
          <CommandList>
            {isLoading ? (
              <div className='space-y-2 p-3'>
                <Skeleton className='h-5 w-full' />
                <Skeleton className='h-5 w-[90%]' />
              </div>
            ) : (
              <CommandEmpty>No tags found.</CommandEmpty>
            )}
            <CommandGroup heading='Tags'>
              {isLoading
                ? null
                : (tags as Tag[]).map((tag) => (
                    <CommandItem
                      key={tag.slug}
                      value={tag.name}
                      onSelect={() => {
                        onChange(tag.slug!, tag);
                        setOpen(false);
                      }}
                      className='cursor-pointer'
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === tag.slug ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <div className='truncate'>{tag.name}</div>
                    </CommandItem>
                  ))}
            </CommandGroup>
            {allowCreate && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    navigate(`/dashboard/${workspaceSlug}/tags`);
                  }}
                  className='cursor-pointer text-primary'
                >
                  <Settings className='mr-2 h-4 w-4' />
                  Manage tags
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

