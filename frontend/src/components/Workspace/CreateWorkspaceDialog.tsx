import { useState } from 'react';
import { useCreateWorkspace } from '@/hooks/useWorkspace';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomSuffix = '';
  for (let i = 0; i < 4; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const finalSlug = `${baseSlug}-${randomSuffix}`;
  return finalSlug.length > 5 ? finalSlug : `workspace-${randomSuffix}`;
}
export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState('');
  const createWorkspace = useCreateWorkspace();

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) return;

    try {
      const workspaceData = {
        workspaceName: trimmedName, // Changed back to workspaceName
        workspaceSlug: generateSlug(trimmedName), // Changed back to workspaceSlug
      };

      const response = await createWorkspace.mutateAsync(workspaceData);

      if (response?.slug) {
        onOpenChange(false);
        setName('');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Workspace creation error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to create workspace';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a workspace to organize your content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateWorkspace} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Workspace Name</Label>
            <Input
              id='name'
              name='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter workspace name'
              className='w-full'
              autoComplete='off'
              required
              minLength={1}
              maxLength={50}
            />
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                onOpenChange(false);
                setName('');
              }}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={!name.trim() || createWorkspace.isPending}
            >
              {createWorkspace.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
