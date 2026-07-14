import { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useUserWorkspaces } from '@/hooks/useWorkspace';
import { Settings, ChevronsUpDown } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getLastWorkspaceSlugs, updateLastWorkspaceCookie } from '@/lib/utils';

function RoleBadge({ role }: { role: string }) {
  return (
    <span className='inline-flex items-center rounded-full bg-secondary/80 text-secondary-foreground px-1.5 py-0 text-[10px] font-medium shrink-0'>
      {role}
    </span>
  );
}

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { data: workspaces = [], isLoading } = useUserWorkspaces();
  const { previous: lastUsedSlug } = getLastWorkspaceSlugs();

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

  const currentWorkspace = useMemo(() => {
    if (!workspaceSlug) return null;
    return workspaces.find((ws) => ws.slug === workspaceSlug) || null;
  }, [workspaces, workspaceSlug]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  const getWorkspaceColor = (index: number) => {
    return workspaceColors[index % workspaceColors.length];
  };

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size='lg'
            className='justify-center group-data-[state=expanded]:justify-start'
          >
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'></div>
            <div className='grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden'>
              <span className='truncate font-medium'>Loading...</span>
              <span className='truncate text-xs'>Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!currentWorkspace) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='justify-center group-data-[state=expanded]:justify-start'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
                  <span className='text-sm font-semibold'>?</span>
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden'>
                  <span className='truncate font-medium'>Select Workspace</span>
                  <span className='truncate text-xs'>Choose a workspace</span>
                </div>
                <ChevronsUpDown className='ml-auto group-data-[state=collapsed]:hidden' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-[280px]'>
              <DropdownMenuLabel>Your Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((workspace) => {
                const currentRoutePath = getCurrentRoutePath();
                const targetPath = currentRoutePath
                  ? `/dashboard/${workspace.slug}${currentRoutePath}`
                  : `/dashboard/${workspace.slug}`;

                return (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => {
                      setOpen(false);
                      navigate(targetPath);
                    }}
                    className='flex flex-col items-start gap-1.5 min-w-0'
                  >
                  <div className='flex items-center gap-2 w-full min-w-0'>
                    <span className='truncate text-sm font-medium'>
                      {workspace.name}
                    </span>
                    <RoleBadge role={workspace.role} />
                    {workspace.slug === lastUsedSlug && (
                      <Badge className='h-4 text-[10px] px-1.5'>
                        Last used
                      </Badge>
                    )}
                  </div>
                  <span className='truncate text-xs text-muted-foreground'>
                    {workspace.slug}
                  </span>
                </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  setOpen(false);
                  navigate('/workspaces');
                }}
              >
                <Settings className='mr-2 h-4 w-4' />
                Manage Workspaces
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const initials = getInitials(currentWorkspace.name);
  const currentIndex = workspaces.findIndex(
    (ws) => ws.id === currentWorkspace.id,
  );
  const colorClass = getWorkspaceColor(currentIndex);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-center group-data-[state=expanded]:justify-start'
            >
              <div
                className={`flex aspect-square h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
              >
                <span className='text-sm font-bold text-background'>
                  {initials}
                </span>
              </div>
              <div className='grid flex-1 text-left leading-relaxed min-w-0 group-data-[state=collapsed]:hidden gap-1.5'>
                <div className='flex items-center gap-2 min-w-0'>
                  <span className='truncate text-sm font-medium'>
                    {currentWorkspace.name}
                  </span>
                  <RoleBadge role={currentWorkspace.role} />
                </div>
                <span className='truncate text-xs text-muted-foreground'>
                  {currentWorkspace.slug}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto group-data-[state=collapsed]:hidden' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side='right'
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Your Workspaces
            </DropdownMenuLabel>
            {workspaces.map((workspace) => {
              const wsInitials = getInitials(workspace.name);
              const wsIndex = workspaces.findIndex(
                (ws) => ws.id === workspace.id,
              );
              const wsColor = getWorkspaceColor(wsIndex);
              const isActive = workspace.id === currentWorkspace.id;
              const currentRoutePath = getCurrentRoutePath();
              const targetPath = currentRoutePath
                ? `/dashboard/${workspace.slug}${currentRoutePath}`
                : `/dashboard/${workspace.slug}`;

              return (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => {
                    if (!isActive) {
                      setOpen(false);
                      updateLastWorkspaceCookie(workspace.slug);
                      navigate(targetPath);
                    }
                  }}
                  className='gap-2 p-2'
                  disabled={isActive}
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-md border ${wsColor}`}
                  >
                    <span className='text-sm font-bold text-background'>
                      {wsInitials}
                    </span>
                  </div>
                  <div className='flex flex-col gap-1.5 flex-1 min-w-0'>
                    <div className='flex items-center gap-2 min-w-0'>
                      <span className='truncate text-sm font-medium'>
                        {workspace.name}
                      </span>
                      <RoleBadge role={workspace.role} />
                      {workspace.slug === lastUsedSlug && (
                        <Badge className='h-4 text-[10px] px-1.5'>
                          Last used
                        </Badge>
                      )}
                    </div>
                    <span className='truncate text-xs text-muted-foreground'>
                      {workspace.slug}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                setOpen(false);
                navigate('/workspaces');
              }}
              className='gap-2 p-2'
            >
              <div className='flex size-8 items-center justify-center rounded-md border bg-transparent'>
                <Settings className='size-4' />
              </div>
              <div className='text-muted-foreground font-medium'>
                Manage Workspaces
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
