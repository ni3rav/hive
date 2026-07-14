import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Edit, LogOut } from 'lucide-react';

interface ProfileOverviewCardProps {
  name: string;
  email: string;
  isLoggingOut: boolean;
  onEdit: () => void;
  onLogout: () => void;
}

export function ProfileOverviewCard({
  name,
  email,
  isLoggingOut,
  onEdit,
  onLogout,
}: ProfileOverviewCardProps) {
  return (
    <Card className='rounded-md border border-foreground/10 bg-card/40 p-1'>
      <CardHeader>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <Avatar className='h-14 w-14'>
              <AvatarImage src={undefined} alt={name} />
              <AvatarFallback className='bg-primary text-xl font-medium text-primary-foreground'>
                {name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className='text-lg font-semibold'>{name}</CardTitle>
              <CardDescription>{email}</CardDescription>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={onEdit}>
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                'Logging out...'
              ) : (
                <>
                  <LogOut className='mr-2 h-4 w-4' />
                  Logout
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
