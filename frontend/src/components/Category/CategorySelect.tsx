import { useMemo, useState } from 'react';
import { useCategories } from '@/hooks/useCategory';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  value?: string | null;
  onChange: (categoryId: string | null) => void;
  placeholder?: string;
};

export default function CategorySelect({ value, onChange, placeholder = 'Select category' }: Props) {
  const { data } = useCategories();
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => data.find((c) => c.id === value), [data, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' role='combobox' aria-expanded={open} className='w-full justify-between'>
          {selected ? selected.name : placeholder}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
        <Command>
          <CommandInput placeholder='Search categories...' />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            {data.map((c) => (
              <CommandItem key={c.id ?? c.slug} value={c.name} onSelect={() => { onChange(c.id ?? null); setOpen(false); }}>
                <Check className={cn('mr-2 h-4 w-4', c.id === value ? 'opacity-100' : 'opacity-0')} />
                {c.name}
              </CommandItem>
            ))}
            <CommandItem value='none' onSelect={() => { onChange(null); setOpen(false); }}>
              <Check className={cn('mr-2 h-4 w-4', !value ? 'opacity-100' : 'opacity-0')} />
              None
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}