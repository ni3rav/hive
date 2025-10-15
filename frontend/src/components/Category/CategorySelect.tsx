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
import { useUserCategories } from '@/hooks/useCategory';
import type { Category } from '@/types/category';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
interface CategorySelectProps {
  value: string | null;
  onChange: (categoryId: string | null, category?: Category | null) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export default function CategorySelect({
  value,
  onChange,
  placeholder = 'Select category...',
  allowCreate = true,
}: CategorySelectProps) {
  const navigate = useNavigate();
  const { data: categories = [], isLoading } = useUserCategories() as {
    data: Category[];
    isLoading: boolean;
  };
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(
    () => categories.find((c) => c.id === value) ?? null,
    [categories, value],
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
          <CommandInput placeholder='Search categories...' />
          <CommandList>
            {isLoading ? (
              <div className='space-y-2 p-3'>
                <Skeleton className='h-5 w-full' />
                <Skeleton className='h-5 w-[90%]' />
              </div>
            ) : (
              <CommandEmpty>No categories found.</CommandEmpty>
            )}
            <CommandGroup heading='Categories'>
              {isLoading
                ? null
                :
                  (categories as Category[]).map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name} 
                      onSelect={() => {
                        onChange(category.id!, category);
                        setOpen(false);
                      }}
                      className='cursor-pointer'
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === category.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <div className='truncate'>{category.name}</div>
                    </CommandItem>
                  ))}
            </CommandGroup>
            {allowCreate && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    navigate('/dashboard/categories');
                  }}
                  className='cursor-pointer text-primary'
                >
                  <Settings className='mr-2 h-4 w-4' />
                  Manage categories
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}