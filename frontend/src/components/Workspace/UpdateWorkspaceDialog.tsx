import { useState, useEffect } from 'react';
import { useUpdateWorkspace } from '@/hooks/useWorkspace';
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
import { getErrorMessage } from '@/lib/error-utils';

interface UpdateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  currentName: string;
}

export function UpdateWorkspaceDialog({
  open,
  onOpenChange,
  workspaceSlug,
  currentName,
}: UpdateWorkspaceDialogProps) {
  const [name, setName] = useState(currentName);
  const updateWorkspace = useUpdateWorkspace();

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) return;
    if (trimmedName === currentName) {
      onOpenChange(false);
      return;
    }

    try {
      await updateWorkspace.mutateAsync({
        workspaceSlug,
        data: { name: trimmedName },
      });
      onOpenChange(false);
      setName('');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to update workspace');
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Workspace Name</DialogTitle>
          <DialogDescription>
            You cannot change the workspace slug.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdateWorkspace} className='space-y-4'>
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
              minLength={3}
              maxLength={30}
            />
            <p className='text-xs text-muted-foreground'>
              Workspace slug:{' '}
              <code className='bg-muted px-1 rounded'>{workspaceSlug}</code>
            </p>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                onOpenChange(false);
                setName(currentName);
              }}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={
                !name.trim() ||
                name.trim() === currentName ||
                updateWorkspace.isPending
              }
            >
              {updateWorkspace.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
