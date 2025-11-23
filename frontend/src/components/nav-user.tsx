import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}) {
  const navigate = useNavigate();

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <SidebarMenu>
      {/* Theme toggle - above avatar in collapsed state */}
      <SidebarMenuItem className='group-data-[state=collapsed]:block group-data-[state=expanded]:hidden'>
        <div className='flex justify-center'>
          <ThemeToggle />
        </div>
      </SidebarMenuItem>
      
      {/* User info */}
      <SidebarMenuItem>
        <div className='flex w-full items-center gap-2 group-data-[state=expanded]:gap-2'>
          <SidebarMenuButton
            size='lg'
            className='flex-1 justify-center group-data-[state=expanded]:justify-start'
            onClick={goToProfile}
            aria-label='Open profile'
            title='Open profile'
          >
            <Avatar className='h-8 w-8 rounded-lg'>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className='rounded-lg bg-primary text-primary-foreground'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden'>
              <span className='truncate font-medium'>{user.name}</span>
              <span className='truncate text-xs'>{user.email}</span>
            </div>
          </SidebarMenuButton>
          {/* Theme toggle - right side in expanded state */}
          <div className='group-data-[state=collapsed]:hidden'>
            <ThemeToggle />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
