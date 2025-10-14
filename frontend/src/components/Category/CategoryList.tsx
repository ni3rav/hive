import { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import type { Category } from '@/types/category';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Pencil, Trash2 } from 'lucide-react';

type Props = {
  categories: Category[];
  onAddCategory: () => void;
  onEditCategory: (c: Category) => void;
  onDeleteCategory: (id: string) => void;
};

export default function CategoryList({ categories, onAddCategory, onEditCategory, onDeleteCategory }: Props) {
  const [q, setQ] = useState('');
  const debouncedQ = useDebounce(q, 200);

  const filtered = useMemo(() => {
    const s = debouncedQ.trim().toLowerCase();
    if (!s) return categories;
    return categories.filter(
      (c) =>
        (c.name ?? '').toLowerCase().includes(s) ||
        (c.slug ?? '').toLowerCase().includes(s) ||
        (c.description ?? '').toLowerCase().includes(s),
    );
  }, [categories, debouncedQ]);

  return (
    <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
      <CardHeader className='gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage your categories</CardDescription>
        </div>
        <div className='flex w-full gap-2 sm:w-auto'>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search categories...' className='sm:w-64' />
          <Button onClick={onAddCategory}><Plus size={16} className='mr-1' />Add Category</Button>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className='flex items-center justify-center rounded-lg border border-dashed p-10 text-center'>No categories.</div>
        ) : (
          <div className='divide-y'>
            {filtered.map((c) => (
              <div key={c.id ?? c.slug} className='flex items-center justify-between py-3'>
                <div className='flex min-w-0 items-center gap-3'>
                  <Avatar className='h-9 w-9'><AvatarFallback>{c.name?.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className='min-w-0'>
                    <div className='truncate font-medium'>{c.name}</div>
                    <div className='truncate text-sm text-muted-foreground'>/{c.slug}</div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Button size='sm' variant='outline' onClick={() => onEditCategory(c)}><Pencil size={16} className='mr-1' />Edit</Button>
                  {c.id && <Button size='sm' variant='destructive' onClick={() => onDeleteCategory(c.id!)}><Trash2 size={16} className='mr-1' />Delete</Button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}