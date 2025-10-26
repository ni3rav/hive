import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserWorkspaces } from '@/hooks/useWorkspace';
import { HexagonIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const navigate = useNavigate();
  const { data: workspaces = [], isLoading } = useUserWorkspaces();

  return (
    <div className="flex items-center gap-2">
      <HexagonIcon className="h-6 w-6 text-primary" />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start">
            <span className="truncate">
              {isLoading ? 'Loading...' : 'Select Workspace'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Your Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => {
                setOpen(false);
                navigate(`/dashboard/${workspace.slug}`);
              }}
            >
              {workspace.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowCreateDialog(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
}
