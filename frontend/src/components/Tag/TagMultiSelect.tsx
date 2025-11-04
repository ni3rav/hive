import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceTags } from '@/hooks/useTag';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TagMultiSelectProps {
  value: string[];
  onChange: (tagSlugs: string[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export default function TagMultiSelect({
  value,
  onChange,
  placeholder = 'Select tags...',
  allowCreate = true,
}: TagMultiSelectProps) {
  const navigate = useNavigate();
  const workspaceSlug = useWorkspaceSlug();
  const { data: tags = [], isLoading } = useWorkspaceTags(workspaceSlug!);
  const [open, setOpen] = useState(false);

  const selectedTags = useMemo(
    () => tags.filter((tag) => value.includes(tag.slug)),
    [tags, value],
  );

  const handleSelect = (tagSlug: string) => {
    const newValue = value.includes(tagSlug)
      ? value.filter((s) => s !== tagSlug)
      : [...value, tagSlug];
    onChange(newValue);
  };

  const handleRemove = (tagSlug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((s) => s !== tagSlug));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between h-auto min-h-10'
        >
          {isLoading ? (
            <Skeleton className='h-5 w-40' />
          ) : (
            <div className='flex flex-wrap gap-1 flex-1'>
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <Badge
                    key={tag.slug}
                    variant='secondary'
                    className='bg-muted hover:bg-muted text-foreground'
                    title={`slug: ${tag.slug}`}
                  >
                    {tag.name}
                    <button
                      type='button'
                      onClick={(e) => handleRemove(tag.slug, e)}
                      className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                    >
                      <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className='text-muted-foreground'>{placeholder}</span>
              )}
            </div>
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
              {!isLoading &&
                tags.map((tag) => (
                  <CommandItem
                    key={tag.slug}
                    value={tag.name}
                    onSelect={() => handleSelect(tag.slug)}
                    className='cursor-pointer'
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value.includes(tag.slug) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className='flex flex-col flex-1 min-w-0'>
                      <div className='truncate'>{tag.name}</div>
                      <div className='truncate text-xs text-muted-foreground'>
                        {tag.slug}
                      </div>
                    </div>
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
