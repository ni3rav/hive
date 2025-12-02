import * as React from 'react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { SquareTerminal, Users, FileText, Layers, Tag, UserCog, Key } from 'lucide-react';
import { WorkspaceSwitcher } from '@/components/Workspace/workspaceSwitcher';
import { useParams } from 'react-router-dom';

const navItems = [
  {
    title: 'Dashboard',
    url: '',
    icon: SquareTerminal,
  },
  {
    title: 'Posts',
    url: 'posts',
    icon: FileText,
  },
  {
    title: 'Authors',
    url: 'authors',
    icon: Users,
  },
  {
    title: 'Categories',
    url: 'categories',
    icon: Layers,
  },
  {
    title: 'Tags',
    url: 'tags',
    icon: Tag,
  },
  {
    title: 'Members',
    url: 'members',
    icon: UserCog,
  },
];

const developerItems = [
  {
    title: 'API Keys',
    url: 'keys',
    icon: Key,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading } = useAuth();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();

  // Build workspace-aware URLs
  const navMainItems = navItems.map((item) => ({
    ...item,
    url: workspaceSlug
      ? item.url
        ? `/dashboard/${workspaceSlug}/${item.url}`
        : `/dashboard/${workspaceSlug}`
      : item.url
        ? `/dashboard/${item.url}`
        : '/dashboard',
  }));

  const navDeveloperItems = developerItems.map((item) => ({
    ...item,
    url: workspaceSlug
      ? `/dashboard/${workspaceSlug}/${item.url}`
      : `/dashboard/${item.url}`,
  }));

  return (
    <Sidebar collapsible='icon' {...props} variant='floating'>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavMain items={navDeveloperItems} label='Developers' />
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <Skeleton className='h-14 w-full' />
        ) : user ? (
          <NavUser user={user} />
        ) : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
