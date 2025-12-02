import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, UserPlus, Shield, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { inviteMemberSchema } from '@/lib/validations/member';
import { useInviteMember } from '@/hooks/useMember';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import type { InviteMemberData, MemberRole } from '@/types/member';
import { ROLE_HIERARCHY } from '@/types/member';

export default function InviteMember() {
  const workspaceSlug = useWorkspaceSlug();
  const { data: workspace } = useWorkspaceVerification(workspaceSlug);
  const navigate = useNavigate();
  const inviteMemberMutation = useInviteMember(workspaceSlug);

  const currentUserRole = (workspace?.role || 'member') as MemberRole;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<InviteMemberData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const availableRoles: MemberRole[] = (
    ['owner', 'admin', 'member'] as MemberRole[]
  ).filter((role) => ROLE_HIERARCHY[role] < ROLE_HIERARCHY[currentUserRole]);

  const onFormSubmit = handleSubmit((data) => {
    inviteMemberMutation.mutate(data, {
      onSuccess: () => {
        reset();
        navigate(`/dashboard/${workspaceSlug}/members`);
      },
    });
  });

  const getRoleIcon = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return <Crown className='h-4 w-4' />;
      case 'admin':
        return <Shield className='h-4 w-4' />;
      case 'member':
        return <Users className='h-4 w-4' />;
    }
  };

  const getRoleDescription = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return 'Full access to manage workspace and all members';
      case 'admin':
        return 'Can manage members and workspace settings';
      case 'member':
        return 'Can view and contribute to workspace content';
    }
  };

  if (currentUserRole === 'member') {
    navigate(`/dashboard/${workspaceSlug}/members`);
    return null;
  }

  return (
    <div className='p-6'>
      <Card className='mx-auto max-w-2xl animate-in fade-in-50 zoom-in-95 duration-300'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate(`/dashboard/${workspaceSlug}/members`)}
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <UserPlus className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle>Invite Member</CardTitle>
                <CardDescription>
                  Send an invitation to join this workspace
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onFormSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                Email Address
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='user@example.com'
                {...register('email')}
                className={
                  errors.email
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                }
                autoFocus
              />
              {errors.email?.message && (
                <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <div className='space-y-2'>
                <Controller
                  name='role'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id='role'
                        className={
                          errors.role
                            ? 'border-destructive focus-visible:ring-destructive w-full'
                            : 'w-full'
                        }
                      >
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className='flex items-center gap-2'>
                              {getRoleIcon(role)}
                              <span>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {watch('role') && (
                  <div className='flex items-start gap-2 rounded-md border bg-muted/50 p-3 text-sm'>
                    <div className='mt-0.5 text-muted-foreground'>
                      {getRoleIcon(watch('role') as MemberRole)}
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium'>
                        {watch('role')?.charAt(0).toUpperCase() +
                          watch('role')?.slice(1)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {getRoleDescription(watch('role') as MemberRole)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {errors.role?.message && (
                <p className='text-sm font-medium text-destructive animate-in fade-in-50 slide-in-from-top-1'>
                  {errors.role.message}
                </p>
              )}
            </div>
            <div className='flex justify-end gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate(`/dashboard/${workspaceSlug}/members`)}
                disabled={inviteMemberMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={inviteMemberMutation.isPending}>
                <UserPlus
                  size={16}
                  className={`mr-2 ${inviteMemberMutation.isPending ? 'opacity-50' : ''}`}
                />
                {inviteMemberMutation.isPending
                  ? 'Sending...'
                  : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
