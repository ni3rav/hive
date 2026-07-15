import type { Author } from '@/types/author';
import { useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Pencil, Trash2, Users } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  authors: Author[];
  onEditAuthor: (a: Author) => void;
  onDeleteAuthor: (authorId: string) => void; // ensure this prop exists
  onDeleteSelected?: (authorIds: string[]) => void;
  onAddAuthor?: () => void;
};

export default function AuthorList({
  authors,
  onAddAuthor,
  onEditAuthor,
  onDeleteAuthor,
  onDeleteSelected,
}: Props) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.about?.toLowerCase().includes(q),
    );
  }, [authors, search]);

  // Replace any window.confirm/alert with a straight callback
  const handleDeleteClick = (id: string) => {
    // Before:
    // if (window.confirm('Are you sure?')) { onDeleteAuthor(id) }
    // After:
    onDeleteAuthor(id);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id!)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = () => {
    if (onDeleteSelected && selectedIds.size > 0) {
      onDeleteSelected(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
      <CardHeader>
        <div>
          <CardTitle>Authors</CardTitle>
          <CardDescription>Manage your author profiles</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {authors.length > 0 && (
          <div className='flex items-center gap-2 pt-0 pb-4'>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search authors...'
              className='sm:w-64'
            />
            {selectedIds.size > 0 && onDeleteSelected && (
              <Button
                variant='destructive'
                onClick={handleDeleteSelected}
                className='whitespace-nowrap'
              >
                <Trash2 size={16} className='mr-1' />
                Delete ({selectedIds.size})
              </Button>
            )}
            <Button onClick={onAddAuthor} className='whitespace-nowrap ml-auto'>
              <Plus size={16} className='mr-1' />
              Add Author
            </Button>
          </div>
        )}
        {filtered.length === 0 ? (
          <Empty className='border-dashed animate-in fade-in-50'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Users />
              </EmptyMedia>
              <EmptyTitle>No Authors Yet</EmptyTitle>
              <EmptyDescription>
                {search
                  ? `No authors found matching "${search}". Try a different search term.`
                  : "You haven't created any author profiles yet. Get started by creating your first author."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onAddAuthor} size='sm'>
                <Plus />
                Create Author
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className='divide-y rounded-md border'>
            <div className='flex items-center py-3 px-3 bg-muted/50 rounded-t-lg'>
              <Checkbox
                checked={
                  selectedIds.size === filtered.length ||
                  (selectedIds.size > 0 && 'indeterminate')
                }
                onCheckedChange={toggleSelectAll}
                aria-label='Select all authors'
              />
              <span className='ml-3 text-sm text-muted-foreground'>
                {selectedIds.size > 0
                  ? `${selectedIds.size} selected`
                  : 'Select all'}
              </span>
            </div>
            {filtered.map((author, idx) => (
              <div
                key={author.id ?? idx}
                className='group flex items-center justify-between py-3 px-3 animate-in fade-in-50 slide-in-from-bottom-1 duration-300 hover:bg-muted/30 cursor-pointer'
                style={{ animationDelay: `${Math.min(idx, 6) * 40}ms` }}
                onClick={() => onEditAuthor(author)}
              >
                <div className='flex min-w-0 items-center gap-3'>
                  <Checkbox
                    checked={selectedIds.has(author.id!)}
                    onCheckedChange={() => toggleSelect(author.id!)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label='Select author'
                  />
                  <Avatar className='h-9 w-9'>
                    <AvatarFallback>
                      {author.name
                        ?.split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'AU'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <div className='truncate font-medium'>{author.name}</div>
                    <div className='truncate text-sm text-muted-foreground'>
                      {author.email}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {/* Desktop / larger screens */}
                  <div className='hidden sm:flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAuthor(author);
                      }}
                      className='whitespace-nowrap'
                    >
                      <Pencil size={16} className='mr-1' />
                      Edit
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(author.id!);
                      }}
                      className='whitespace-nowrap'
                    >
                      <Trash2 size={16} className='mr-1' />
                      Delete
                    </Button>
                  </div>

                  {/* Mobile / small screens */}
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
                          onClick={() => onEditAuthor(author)}
                          className='focus:bg-yellow-100 data-[highlighted]:bg-yellow-100 data-[highlighted]:text-yellow-900'
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(author.id!)}
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
