import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { PencilIcon } from 'lucide-react';
import type { UserWorkspace } from '@/types/workspace';

interface EditWorkspaceDialogProps {
  workspace: Pick<UserWorkspace, 'id' | 'name' | 'slug' | 'role'>;
}

export function EditWorkspaceDialog({ workspace }: EditWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(workspace.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is just a dummy implementation
    toast.success('Workspace name updated (dummy)');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity'
        >
          <PencilIcon className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Workspace name'
              autoComplete='off'
            />
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!name.trim() || name === workspace.name}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}