import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useUserAuthors } from '@/hooks/useAuthor';
import type { Author } from '@/types/author';
import { useNavigate } from 'react-router-dom';

interface AuthorSelectProps {
  value: string | null;
  onChange: (authorId: string | null, author?: Author | null) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export default function AuthorSelect({ value, onChange, placeholder = 'Select author...', allowCreate = true }: AuthorSelectProps) {
  const navigate = useNavigate();
  const { data: authors = [], isLoading } = useUserAuthors() as { data: Author[]; isLoading: boolean };
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => authors.find((a) => a.id === value) ?? null, [authors, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.name : isLoading ? 'Loading authors...' : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search authors..." />
          <CommandList>
            <CommandEmpty>No authors found.</CommandEmpty>
            <CommandGroup heading="Authors">
              {(authors as Author[]).map((author) => (
                <CommandItem
                  key={author.id}
                  value={author.name}
                  onSelect={() => {
                    onChange(author.id!, author);
                    setOpen(false);
                  }}
                  className="cursor-pointer data-[selected]:bg-yellow-100 data-[selected]:text-yellow-900 focus:bg-yellow-100"
                >
                  <Check className={cn('mr-2 h-4 w-4', value === author.id ? 'opacity-100' : 'opacity-0')} />
                  <div className="truncate">{author.name}</div>
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreate && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    navigate('/author?mode=create');
                  }}
                  className="cursor-pointer text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create new author
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}