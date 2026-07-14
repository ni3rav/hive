import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateMemberRoleSchema } from '@/lib/validations/member';
import type { Member, MemberRole, UpdateMemberRoleData } from '@/types/member';
import { ROLE_HIERARCHY } from '@/types/member';
import { Shield, Crown, Users } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSubmit: (data: UpdateMemberRoleData) => void;
  isSubmitting: boolean;
  currentUserRole: MemberRole;
};

export default function EditMemberDialog({
  open,
  onOpenChange,
  member,
  onSubmit,
  isSubmitting,
  currentUserRole,
}: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateMemberRoleData>({
    resolver: zodResolver(updateMemberRoleSchema),
    defaultValues: {
      role: member?.role || 'member',
    },
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

  useEffect(() => {
    if (member) {
      reset({ role: member.role });
    }
  }, [member, reset]);

  const availableRoles: MemberRole[] = (
    ['owner', 'admin', 'member'] as MemberRole[]
  ).filter(
    (role) =>
      ROLE_HIERARCHY[role] < ROLE_HIERARCHY[currentUserRole] ||
      role === member?.role,
  );

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
    onOpenChange(false);
  });

  const handleClose = () => {
    if (member) {
      reset({ role: member.role });
    }
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Member Role</DialogTitle>
          <DialogDescription>
            Update the role for {member.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onFormSubmit}>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Controller
                name='role'
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id='role'
                      className={
                        errors.role
                          ? 'border-destructive focus-visible:ring-destructive'
                          : ''
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
              {errors.role?.message && (
                <p className='text-sm font-medium text-destructive'>
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
