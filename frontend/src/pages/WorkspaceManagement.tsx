import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserWorkspaces } from '@/hooks/useWorkspace';
import { CreateWorkspaceDialog } from '@/components/Workspace/CreateWorkspaceDialog';
import { PlusIcon, HexagonIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function WorkspaceManagementPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);
  const navigate = useNavigate();
  const { data: workspaces = [], isLoading } = useUserWorkspaces();

  const handleNavigateToWorkspace = (slug: string) => {
    navigate(`/dashboard/${slug}`);
  };

  const handleDeleteWorkspace = (
    workspace: { id: string; name: string; slug: string },
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setWorkspaceToDelete(workspace);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Add API call to delete workspace
    console.log('Deleting workspace:', workspaceToDelete);
    toast.error('Workspace deletion is not yet implemented');
    setDeleteDialogOpen(false);
    setWorkspaceToDelete(null);
  };

  const workspaceColors = [
    'bg-chart-1',
    'bg-chart-2',
    'bg-chart-3',
    'bg-chart-4',
    'bg-chart-5',
    'bg-primary',
    'bg-secondary',
    'bg-accent',
  ];

  return (
    <div className='min-h-screen w-full bg-background flex flex-col items-center justify-center px-6'>
      {/* Title */}
      <h1 className='text-3xl md:text-4xl text-foreground mb-12'>
        Select a workspace
      </h1>

      {/* Workspace Cards */}
      <div className='flex flex-wrap gap-8 justify-center mb-12 max-w-6xl'>
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='flex flex-col items-center'>
                <Skeleton className='w-48 h-48 mb-4' />
                <Skeleton className='h-6 w-32' />
              </div>
            ))}
          </>
        ) : workspaces.length === 0 ? (
          <div className='text-center max-w-md'>
            <div className='mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6'>
              <HexagonIcon className='h-12 w-12 text-primary' />
            </div>
            <h2 className='text-2xl font-semibold mb-2 text-foreground'>
              No workspaces yet
            </h2>
            <p className='text-muted-foreground mb-6'>
              Create your first workspace to start organizing your content
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size='lg'
              className='h-12 px-8'
            >
              <PlusIcon className='mr-2 h-5 w-5' />
              Create Your First Workspace
            </Button>
          </div>
        ) : (
          <>
            {workspaces.map((workspace, index) => {
              const colorClass =
                workspaceColors[index % workspaceColors.length];
              const initials = workspace.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={workspace.id}
                  className='flex flex-col items-center cursor-pointer group relative'
                  onClick={() => handleNavigateToWorkspace(workspace.slug)}
                >
                  <div
                    className={cn(
                      'w-48 h-48 rounded-xl',
                      colorClass,
                      'flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-lg group-hover:shadow-2xl hover:shadow-2xl',
                    )}
                  >
                    <span className='text-6xl font-bold text-background'>
                      {initials}
                    </span>
                    {/* Delete button overlay */}
                    <Button
                      variant='destructive'
                      size='icon'
                      className='absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity'
                      onClick={(e) => handleDeleteWorkspace(workspace, e)}
                    >
                      <TrashIcon className='h-4 w-4' />
                    </Button>
                  </div>
                  <span className='text-muted-foreground text-lg group-hover:text-foreground transition-colors'>
                    {workspace.name}
                  </span>
                  <div className='flex items-center gap-2 mt-2'>
                    <Badge variant='secondary' className='text-xs'>
                      {workspace.role}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      {workspace.slug}
                    </Badge>
                  </div>
                </div>
              );
            })}

            {/* Add Workspace Card */}
            <div
              className='flex flex-col items-center cursor-pointer group'
              onClick={() => setShowCreateDialog(true)}
            >
              <div className='w-48 h-48 rounded-xl bg-muted/40 border-2 border-dashed border-border flex flex-col items-center justify-center mb-4 transition-all group-hover:border-primary group-hover:bg-muted/60'>
                <PlusIcon className='h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors' />
              </div>
              <span className='text-muted-foreground text-lg group-hover:text-foreground transition-colors'>
                Add Workspace
              </span>
            </div>
          </>
        )}
      </div>

      {/* Back Button */}
      <Button
        onClick={() => navigate('/workspaces')}
        variant='outline'
        className='border-border text-foreground hover:bg-muted hover:border-border'
      >
        Back
      </Button>

      <CreateWorkspaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{workspaceToDelete?.name}
              &quot;? This action cannot be undone and all workspace data will
              be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
