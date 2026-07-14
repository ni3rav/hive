import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDeleteWorkspace, useUserWorkspaces } from '@/hooks/useWorkspace';
import { CreateWorkspaceDialog } from '@/components/Workspace/CreateWorkspaceDialog';
import { UpdateWorkspaceDialog } from '@/components/Workspace/UpdateWorkspaceDialog';
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react';
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
import {
  cn,
  getLastWorkspaceSlugs,
  updateLastWorkspaceCookie,
} from '@/lib/utils';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export function WorkspaceManagementPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);
  const [workspaceToUpdate, setWorkspaceToUpdate] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { data: workspaces = [], isLoading } = useUserWorkspaces();
  const { current: lastUsedSlug } = getLastWorkspaceSlugs();
  const deleteWorkspace = useDeleteWorkspace();

  useHead(
    createSEOMetadata({
      title: 'Workspaces',
      description: 'Manage your workspaces',
      noindex: true,
    }),
  );

  // Extract the current route path after the workspace slug
  const getCurrentRoutePath = () => {
    if (!workspaceSlug) return '';
    const basePath = `/dashboard/${workspaceSlug}`;
    if (location.pathname.startsWith(basePath)) {
      const remainingPath = location.pathname.slice(basePath.length);
      return remainingPath || '';
    }
    return '';
  };

  const handleNavigateToWorkspace = (slug: string) => {
    updateLastWorkspaceCookie(slug);
    const currentRoutePath = getCurrentRoutePath();
    const targetPath = currentRoutePath
      ? `/dashboard/${slug}${currentRoutePath}`
      : `/dashboard/${slug}`;
    navigate(targetPath);
  };

  const handleDeleteWorkspace = (
    workspace: { id: string; name: string; slug: string },
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setWorkspaceToDelete(workspace);
    setDeleteDialogOpen(true);
  };

  const handleUpdateWorkspace = (
    workspace: { slug: string; name: string },
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setWorkspaceToUpdate(workspace);
    setUpdateDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;

    try {
      await deleteWorkspace.mutateAsync(workspaceToDelete.slug);
      setDeleteDialogOpen(false);
      setWorkspaceToDelete(null);
      navigate('/workspaces');
    } catch (error) {
      console.error('Error deleting workspace:', error);
    }
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
    <div className='min-h-screen w-full bg-background flex flex-col items-center justify-center p-4'>
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
          <AddWorkspaceCard setShowCreateDialog={setShowCreateDialog} />
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
                    {workspace.slug === lastUsedSlug && (
                      <Badge className='absolute top-2 left-2 h-5 text-[10px] px-1.5 pointer-events-none bg-accent-foreground'>
                        Last used
                      </Badge>
                    )}
                    <span className='text-6xl font-bold text-background'>
                      {initials}
                    </span>
                    {/* Action buttons overlay - owner only */}
                    {workspace.role === 'owner' && (
                      <>
                        <Button
                          variant='default'
                          size='icon'
                          className='absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background'
                          onClick={(e) =>
                            handleUpdateWorkspace(
                              { slug: workspace.slug, name: workspace.name },
                              e,
                            )
                          }
                        >
                          <PencilIcon className='h-4 w-4 text-foreground' />
                        </Button>
                        <Button
                          variant='destructive'
                          size='icon'
                          className='absolute top-2 right-12 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity'
                          onClick={(e) => handleDeleteWorkspace(workspace, e)}
                        >
                          <TrashIcon className='h-4 w-4' />
                        </Button>
                      </>
                    )}
                  </div>
                  <span className='text-muted-foreground text-lg group-hover:text-foreground transition-colors max-w-48 text-ellipsis text-center'>
                    {workspace.name}
                  </span>
                  <div className='flex flex-col items-center gap-2 mt-2'>
                    <Badge variant='outline' className='text-xs'>
                      {workspace.slug}
                    </Badge>
                    <Badge variant='secondary' className='text-xs'>
                      {workspace.role}
                    </Badge>
                  </div>
                </div>
              );
            })}

            <AddWorkspaceCard setShowCreateDialog={setShowCreateDialog} />
          </>
        )}
      </div>

      {/* Back Button */}
      <Button
        onClick={() => {
          // go back in the navigation stack if possible, otherwise fallback
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
        variant='outline'
        className='border-border text-foreground hover:bg-muted hover:border-border'
      >
        Back
      </Button>

      <CreateWorkspaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {workspaceToUpdate && (
        <UpdateWorkspaceDialog
          open={updateDialogOpen}
          onOpenChange={(open) => {
            setUpdateDialogOpen(open);
            if (!open) setWorkspaceToUpdate(null);
          }}
          workspaceSlug={workspaceToUpdate.slug}
          currentName={workspaceToUpdate.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{workspaceToDelete?.name}
              &quot;? This action cannot be undone and will permanently delete
              all workspace data including:
              <ul className='list-disc list-inside mt-2 space-y-1'>
                <li>All posts</li>
                <li>All categories</li>
                <li>All tags</li>
                <li>All authors</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setDeleteDialogOpen(false);
                setWorkspaceToDelete(null);
              }}
              disabled={deleteWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={deleteWorkspace.isPending}
            >
              {deleteWorkspace.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddWorkspaceCard({
  setShowCreateDialog,
}: {
  setShowCreateDialog: (open: boolean) => void;
}) {
  return (
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
  );
}
