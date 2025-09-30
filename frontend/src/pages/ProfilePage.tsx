import { useAuth, useLogout } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  KeyRound,
  BarChart,
  History,
  ChevronRight,
  Edit,
} from 'lucide-react';
import { EditProfileForm } from '@/components/EditProfileForm';
import { useState } from 'react';

function ProfileActionRow({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ElementType;
}) {
  return (
    <button className='group flex w-full items-center justify-between rounded-lg border bg-background p-4 text-left font-medium hover:bg-accent'>
      <div className='flex items-center gap-3'>
        <Icon className='h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent-foreground' />
        <span className='transition-colors group-hover:text-accent-foreground'>
          {label}
        </span>
      </div>
      <ChevronRight className='h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent-foreground' />
    </button>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useAuth();
  const logoutMutation = useLogout();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user'] });
        navigate('/login');
      },
    });
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-background p-4'>
      {isLoading && (
        <Skeleton className='h-[400px] w-full max-w-xl rounded-lg' />
      )}
      {isError && !isLoading && (
        <div className='text-center text-destructive'>
          <h2>Error Loading Profile</h2>
        </div>
      )}
      {user && (
        <>
          {isEditing ? (
            <EditProfileForm
              user={user}
              onCancel={() => setIsEditing(false)}
              onSuccess={handleEditSuccess}
            />
          ) : (
            <Card className='w-full max-w-xl rounded-lg'>
              <CardHeader>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                  <div className='flex items-center gap-4'>
                    <Avatar className='h-14 w-14'>
                      <AvatarImage src={undefined} alt={user.name} />
                      <AvatarFallback className='bg-primary text-xl font-medium text-primary-foreground'>
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className='text-lg font-semibold'>
                        {user.name}
                      </CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      Edit
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? (
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

              <CardContent className='space-y-3'>
                <ProfileActionRow icon={KeyRound} label='Manage API Keys' />
                <ProfileActionRow icon={BarChart} label='Usage Statistics' />
                <ProfileActionRow icon={History} label='Active Sessions' />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
