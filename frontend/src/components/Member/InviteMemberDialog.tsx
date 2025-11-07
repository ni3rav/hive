import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, UserPlus, Shield, Crown, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inviteMemberSchema } from '@/lib/validations/member';
import type { InviteMemberData, MemberRole } from '@/types/member';
import { ROLE_HIERARCHY } from '@/types/member';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InviteMemberData) => void;
  isSubmitting: boolean;
  currentUserRole: MemberRole;
};

export default function InviteMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  currentUserRole,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InviteMemberData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });


  const availableRoles: MemberRole[] = (['owner', 'admin', 'member'] as MemberRole[]).filter(
    (role) => ROLE_HIERARCHY[role] < ROLE_HIERARCHY[currentUserRole],
  );

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
    reset();
    onOpenChange(false);
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <UserPlus className='h-5 w-5 text-primary' />
            </div>
            <div>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription className='mt-1'>
                Send an invitation to join this workspace
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={onFormSubmit}>
          <div className='space-y-5 py-4'>
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
                <select
                  id='role'
                  {...register('role')}
                  className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
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
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              <UserPlus
                size={16}
                className={`mr-2 ${isSubmitting ? 'opacity-50' : ''}`}
              />
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

