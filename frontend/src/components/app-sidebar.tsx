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
import {
  BookOpen,
  SquareTerminal,
  Settings2,
  Users,
  FileText,
  Layers,
  Tag,
} from 'lucide-react';
import { WorkspaceSwitcher } from '@/components/Workspace/workspaceSwitcher';

const navData = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: SquareTerminal,
    },
    {
      title: 'Posts',
      url: '/dashboard/posts',
      icon: FileText,
    },
    {
      title: 'Authors',
      url: '/dashboard/authors',
      icon: Users,
    },
    {
      title: 'Categories',
      url: '/dashboard/categories',
      icon: Layers,
    },
    {
      title: 'Tags',
      url: '/dashboard/tags',
      icon: Tag,
    },
    {
      title: 'Editor',
      url: '/dashboard/editor',
      icon: BookOpen,
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading } = useAuth();

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <div className='flex h-14 items-center px-4'>
          <WorkspaceSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
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
