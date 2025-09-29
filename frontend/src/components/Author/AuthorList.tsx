import type { Author } from '@/types/author';
import { useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  authors: Author[];
  onEditAuthor: (a: Author) => void;
  onDeleteAuthor: (authorId: string) => void; // ensure this prop exists
  onAddAuthor?: () => void;
};

export default function AuthorList({ authors, onAddAuthor, onEditAuthor, onDeleteAuthor }: Props) {
  const [search, setSearch] = useState('');

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

  return (
    <Card className="animate-in fade-in-50 zoom-in-95 duration-300">
      <CardHeader className="gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Authors</CardTitle>
          <CardDescription>Manage your author profiles</CardDescription>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search authors..."
            className="sm:w-64"
          />
          <Button onClick={onAddAuthor} className="whitespace-nowrap">
            <Plus size={16} className="mr-1" />
            Add Author
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center animate-in fade-in-50">
            <div className="mb-2 text-sm text-muted-foreground">No authors found.</div>
            <Button onClick={onAddAuthor} size="sm">
              <Plus size={16} className="mr-1" />
              Create your first author
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((author, idx) => (
              <div
                key={author.id ?? idx}
                className="group flex items-center justify-between py-3 animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
                style={{ animationDelay: `${Math.min(idx, 6) * 40}ms` }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {author.name?.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'AU'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{author.name}</div>
                    <div className="truncate text-sm text-muted-foreground">{author.email}</div>
                  </div>
                </div>

                {/* Actions: buttons on >= sm, menu on < sm */}
                <div className="flex items-center gap-2">
                  {/* Desktop / larger screens */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditAuthor(author)}
                      className="whitespace-nowrap"
                    >
                      <Pencil size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(author.id!)}
                      className="whitespace-nowrap"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </div>

                  {/* Mobile / small screens */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Actions" className="hover:bg-muted/60">
                          <MoreHorizontal size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => onEditAuthor(author)}
                          className="focus:bg-yellow-100 data-[highlighted]:bg-yellow-100 data-[highlighted]:text-yellow-900"
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(author.id!)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 data-[highlighted]:bg-red-50"
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