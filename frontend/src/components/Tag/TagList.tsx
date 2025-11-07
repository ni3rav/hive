import type { Tag } from '@/types/tag';
import { useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Pencil, Trash2, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  tags: Tag[];
  onEditTag: (t: Tag) => void;
  onDeleteTag: (tagSlug: string) => void;
  onAddTag?: () => void;
};

export default function TagList({
  tags,
  onAddTag,
  onEditTag,
  onDeleteTag,
}: Props) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) || t.slug?.toLowerCase().includes(q),
    );
  }, [tags, search]);

  const handleDeleteClick = (slug: string) => {
    onDeleteTag(slug);
  };

  return (
    <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
      <CardHeader className='gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Manage your content tags</CardDescription>
        </div>
        <div className='flex w-full gap-2 sm:w-auto'>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search tags...'
            className='sm:w-64'
          />
          <Button onClick={onAddTag} className='whitespace-nowrap'>
            <Plus size={16} className='mr-1' />
            Add Tag
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <Empty className='border-dashed animate-in fade-in-50'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <TagIcon />
              </EmptyMedia>
              <EmptyTitle>No Tags Yet</EmptyTitle>
              <EmptyDescription>
                {search
                  ? `No tags found matching "${search}". Try a different search term.`
                  : "You haven't created any tags yet. Get started by creating your first one."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onAddTag} size='sm'>
                <Plus />
                Create Tag
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className='divide-y'>
            {filtered.map((tag, idx) => (
              <div
                key={tag.slug ?? idx}
                className='group flex items-center justify-between py-3 animate-in fade-in-50 slide-in-from-bottom-1 duration-300'
                style={{ animationDelay: `${Math.min(idx, 6) * 40}ms` }}
              >
                <div className='flex min-w-0 items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                    <TagIcon className='h-5 w-5' />
                  </div>
                  <div className='min-w-0'>
                    <div className='truncate font-medium'>{tag.name}</div>
                    <div className='truncate text-sm text-muted-foreground'>
                      {tag.slug}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='hidden sm:flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onEditTag(tag)}
                      className='whitespace-nowrap'
                    >
                      <Pencil size={16} className='mr-1' />
                      Edit
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleDeleteClick(tag.slug!)}
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
                        >
                          <MoreHorizontal size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-40'>
                        <DropdownMenuItem
                          onClick={() => onEditTag(tag)}
                          className='focus:bg-yellow-100 data-[highlighted]:bg-yellow-100 data-[highlighted]:text-yellow-900'
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(tag.slug!)}
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

