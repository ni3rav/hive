// src/components/Member/InviteMemberDialog.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, UserPlus, Shield, Crown, Users, Check, ChevronDown } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuItemIndicator } from '@radix-ui/react-dropdown-menu';
import { inviteMemberSchema } from '@/lib/validations/member';
import type { InviteMemberData, MemberRole } from '@/types/member';
import { ROLE_HIERARCHY } from '@/types/member';
import * as React from 'react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InviteMemberData) => void;
  isSubmitting: boolean;
  currentUserRole: MemberRole;
};

// Helper function to capitalize the first letter of the role
const getRoleName = (role: MemberRole) =>
  role.charAt(0).toUpperCase() + role.slice(1);

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
    watch,
    reset,
  } = useForm<InviteMemberData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const [selectOpen, setSelectOpen] = React.useState(false);
  const selectedRole = watch('role');

  const availableRoles: MemberRole[] = (
    ['owner', 'admin', 'member'] as MemberRole[]
  ).filter((role) => ROLE_HIERARCHY[role] < ROLE_HIERARCHY[currentUserRole]);

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
                <DropdownMenu open={selectOpen} onOpenChange={setSelectOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      aria-expanded={selectOpen}
                      className='w-full justify-between'
                      id='role-select-trigger'
                    >
                      {getRoleName(selectedRole)}
                      <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className='w-[var(--radix-dropdown-menu-trigger-width)]'
                    align='start'
                  >
                    <DropdownMenuRadioGroup
                      value={selectedRole}
                      onValueChange={(newRole) => {
                        // Manually set the value in react-hook-form
                        setValue('role', newRole as MemberRole, {
                          shouldDirty: true,
                        });
                        setSelectOpen(false);
                      }}
                    >
                      {availableRoles.map((role) => (
                        <DropdownMenuRadioItem
                          key={role}
                          value={role}
                          className='min-w-[180px] pl-2 *:first:[span]:hidden'
                        >
                          <span className='pointer-events-none absolute left-2 flex size-3.5 items-center justify-center'>
                            <DropdownMenuItemIndicator>
                              <Check className='h-4 w-4' />
                            </DropdownMenuItemIndicator>
                          </span>
                          <div className='flex flex-col flex-1 min-w-0'>
                            <div className='truncate'>
                              {getRoleName(role)}
                            </div>
                            <div className='truncate text-xs text-muted-foreground'>
                              {getRoleDescription(role)}
                            </div>
                          </div>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {selectedRole && (
                  <div className='flex items-start gap-2 rounded-md border bg-muted/50 p-3 text-sm'>
                    <div className='mt-0.5 text-muted-foreground'>
                      {getRoleIcon(selectedRole as MemberRole)}
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium'>
                        {getRoleName(selectedRole)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {getRoleDescription(selectedRole as MemberRole)}
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