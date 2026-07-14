import * as React from 'react';
import { Check, ChevronsUpDown, Settings, X } from 'lucide-react';
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
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug'; // FIX: Import hook

interface CategorySelectProps {
  value: string | null; // This value should be the category SLUG
  onChange: (categorySlug: string | null, category?: Category | null) => void;
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
  const workspaceSlug = useWorkspaceSlug(); // FIX: Get current workspace slug
  const { data: categories = [], isLoading } = useUserCategories(
    workspaceSlug!,
  ) as {
    data: Category[];
    isLoading: boolean;
  };
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(
    // FIX: Compare value against category.slug
    () => categories.find((c) => c.slug === value) ?? null,
    [categories, value],
  );

  // Memoize categories to prevent unnecessary re-renders
  const memoizedCategories = React.useMemo(
    () => categories as Category[],
    [categories],
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
              title={selected ? `slug: ${selected.slug}` : undefined}
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
              {value && (
                <CommandItem
                  key='__none__'
                  value='__none__'
                  onSelect={() => {
                    onChange(null, null);
                    setOpen(false);
                  }}
                  className='cursor-pointer text-muted-foreground'
                >
                  <X className='mr-2 h-4 w-4' />
                  <span>None</span>
                </CommandItem>
              )}
              {isLoading
                ? null
                : memoizedCategories.map((category) => {
                    const isSelected = value === category.slug;
                    const itemValue = `${category.name}-${category.slug}`;
                    return (
                      <CommandItem
                        key={itemValue}
                        value={itemValue}
                        onSelect={() => {
                          if (isSelected) {
                            onChange(null, null);
                          } else {
                            onChange(category.slug!, category);
                          }
                          setOpen(false);
                        }}
                        className='cursor-pointer'
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <div className='flex flex-col flex-1 min-w-0'>
                          <div className='truncate'>{category.name}</div>
                          <div className='truncate text-xs text-muted-foreground'>
                            {category.slug}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
            </CommandGroup>
            {allowCreate && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    // FIX: Navigate to workspace-specific category page
                    navigate(`/dashboard/${workspaceSlug}/categories`);
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
