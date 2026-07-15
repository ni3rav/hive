import type { Category } from '@/types/category';
import { useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Pencil, Trash2, Tag, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

type Props = {
  categories: Category[];
  onEditCategory: (c: Category) => void;
  // FIX: This prop should expect the category SLUG
  onDeleteCategory: (categorySlug: string) => void;
  onDeleteSelected?: (categorySlugs: string[]) => void;
  onAddCategory?: () => void;
};

export default function CategoryList({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onDeleteSelected,
}: Props) {
  const [search, setSearch] = useState('');
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q),
    );
  }, [categories, search]);

  // FIX: This handler now correctly receives a slug
  const handleDeleteClick = (slug: string) => {
    onDeleteCategory(slug);
  };

  const toggleSelectAll = () => {
    if (selectedSlugs.size === filtered.length) {
      setSelectedSlugs(new Set());
    } else {
      setSelectedSlugs(new Set(filtered.map((c) => c.slug!)));
    }
  };

  const toggleSelect = (slug: string) => {
    const newSet = new Set(selectedSlugs);
    if (newSet.has(slug)) {
      newSet.delete(slug);
    } else {
      newSet.add(slug);
    }
    setSelectedSlugs(newSet);
  };

  const handleDeleteSelected = () => {
    if (onDeleteSelected && selectedSlugs.size > 0) {
      onDeleteSelected(Array.from(selectedSlugs));
      setSelectedSlugs(new Set());
    }
  };

  return (
    <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
      <CardHeader>
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage your content categories</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length > 0 && (
          <div className='flex items-center gap-2 pt-0 pb-4'>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search categories...'
              className='sm:w-64'
            />
            {selectedSlugs.size > 0 && onDeleteSelected && (
              <Button
                variant='destructive'
                onClick={handleDeleteSelected}
                className='whitespace-nowrap'
              >
                <Trash2 size={16} className='mr-1' />
                Delete ({selectedSlugs.size})
              </Button>
            )}
            <Button onClick={onAddCategory} className='whitespace-nowrap ml-auto'>
              <Plus size={16} className='mr-1' />
              Add Category
            </Button>
          </div>
        )}
        {filtered.length === 0 ? (
          <Empty className='border-dashed animate-in fade-in-50'>
            {/* ... (empty state) ... */}
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Layers />
              </EmptyMedia>
              <EmptyTitle>No Categories Yet</EmptyTitle>
              <EmptyDescription>
                {search
                  ? `No categories found matching "${search}". Try a different search term.`
                  : "You haven't created any categories yet. Get started by creating your first one."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onAddCategory} size='sm'>
                <Plus />
                Create Category
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className='divide-y rounded-md border'>
            <div className='flex items-center py-3 px-3 bg-muted/50 rounded-t-lg'>
              <Checkbox
                checked={
                  selectedSlugs.size === filtered.length ||
                  (selectedSlugs.size > 0 && 'indeterminate')
                }
                onCheckedChange={toggleSelectAll}
                aria-label='Select all categories'
              />
              <span className='ml-3 text-sm text-muted-foreground'>
                {selectedSlugs.size > 0
                  ? `${selectedSlugs.size} selected`
                  : 'Select all'}
              </span>
            </div>
            {filtered.map((category, idx) => (
              <div
                key={category.id ?? idx}
                className='group flex items-center justify-between py-3 px-3 animate-in fade-in-50 slide-in-from-bottom-1 duration-300 hover:bg-muted/30 cursor-pointer'
                style={{ animationDelay: `${Math.min(idx, 6) * 40}ms` }}
                onClick={() => onEditCategory(category)}
              >
                <div className='flex min-w-0 items-center gap-3'>
                  {/* ... (category info) ... */}
                  <Checkbox
                    checked={selectedSlugs.has(category.slug!)}
                    onCheckedChange={() => toggleSelect(category.slug!)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label='Select category'
                  />
                  <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                    <Tag className='h-5 w-5' />
                  </div>
                  <div className='min-w-0'>
                    <div className='truncate font-medium'>{category.name}</div>
                    <div className='truncate text-sm text-muted-foreground'>
                      {category.slug}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='hidden sm:flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCategory(category);
                      }}
                      className='whitespace-nowrap'
                    >
                      <Pencil size={16} className='mr-1' />
                      Edit
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      // FIX: Pass category.slug, NOT category.id
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(category.slug!);
                      }}
                      className='whitespace-nowrap'
                    >
                      <Trash2 size={16} className='mr-1' />
                      Delete
                    </Button>
                  </div>
                  <div className='sm:hidden'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label='Actions'
                          className='hover:bg-muted/60'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-40'>
                        <DropdownMenuItem
                          onClick={() => onEditCategory(category)}
                          className='focus:bg-yellow-100 data-[highlighted]:bg-yellow-100 data-[highlighted]:text-yellow-900'
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          // FIX: Pass category.slug, NOT category.id
                          onClick={() => handleDeleteClick(category.slug!)}
                          className='text-red-600 focus:text-red-600 focus:bg-red-50 data-[highlighted]:bg-red-50'
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
