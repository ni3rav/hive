'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Post } from '@/types/post';

interface ColumnsProps {
  onEdit?: (postSlug: string) => void;
  onDelete?: (postSlug: string) => void;
}

export const createColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps = {}): ColumnDef<Post>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='-ml-3 h-8 data-[state=open]:bg-accent'
        >
          Title
          {isSorted === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : isSorted === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4 opacity-50' />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div className='min-w-0'>
          <div className='truncate font-medium'>{post.title || 'Untitled'}</div>
          {post.excerpt && (
            <div className='truncate text-sm text-muted-foreground'>
              {post.excerpt}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as 'draft' | 'published';
      return (
        <Badge
          variant={status === 'published' ? 'default' : 'secondary'}
          className='capitalize'
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ row }) => {
      const author = row.original.author;
      return (
        <div className='text-sm'>
          {author ? (
            author.name
          ) : (
            <span className='text-muted-foreground'>—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <div className='text-sm'>
          {category ? (
            category.name
          ) : (
            <span className='text-muted-foreground'>—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags || tags.length === 0) {
        return <span className='text-sm text-muted-foreground'>—</span>;
      }
      return (
        <div className='flex flex-wrap gap-1'>
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag.slug} variant='outline' className='text-xs'>
              {tag.name}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant='outline' className='text-xs'>
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='-ml-3 h-8 data-[state=open]:bg-accent'
        >
          Created
          {isSorted === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : isSorted === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4 opacity-50' />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return (
        <div className='text-sm'>{format(new Date(date), 'MMM d, yyyy')}</div>
      );
    },
  },
  {
    accessorKey: 'publishedAt',
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='-ml-3 h-8 data-[state=open]:bg-accent'
        >
          Published
          {isSorted === 'asc' ? (
            <ArrowUp className='ml-2 h-4 w-4' />
          ) : isSorted === 'desc' ? (
            <ArrowDown className='ml-2 h-4 w-4' />
          ) : (
            <ArrowUpDown className='ml-2 h-4 w-4 opacity-50' />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('publishedAt') as string | null;
      return (
        <div className='text-sm'>
          {date ? (
            format(new Date(date), 'MMM d, yyyy')
          ) : (
            <span className='text-muted-foreground'>—</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const post = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                if (onEdit) {
                  onEdit(post.slug);
                }
              }}
            >
              <Pencil className='mr-2 h-4 w-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (onDelete) {
                  onDelete(post.slug);
                }
              }}
              className='text-destructive focus:text-destructive'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const columns = createColumns();
