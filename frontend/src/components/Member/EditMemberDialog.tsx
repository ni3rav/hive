import { useForm } from 'react-hook-form';
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
import { updateMemberRoleSchema } from '@/lib/validations/member';
import type { Member, MemberRole, UpdateMemberRoleData } from '@/types/member';
import { ROLE_HIERARCHY } from '@/types/member';

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
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateMemberRoleData>({
    resolver: zodResolver(updateMemberRoleSchema),
    defaultValues: {
      role: member?.role || 'member',
    },
  });

  useEffect(() => {
    if (member) {
      reset({ role: member.role });
    }
  }, [member, reset]);

  const availableRoles: MemberRole[] = (['owner', 'admin', 'member'] as MemberRole[]).filter(
    (role) => ROLE_HIERARCHY[role] < ROLE_HIERARCHY[currentUserRole] || role === member?.role,
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

