import { useState } from 'react';
import {
  useMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useRevokeInvitation,
  useLeaveWorkspace,
} from '@/hooks/useMember';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';
import type {
  Member,
  PendingInvitation,
  UpdateMemberRoleData,
  MemberRole,
} from '@/types/member';
import MemberList from './MemberList';
import EditMemberDialog from './EditMemberDialog';
import LeaveTeamDialog from './LeaveTeamDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export default function MemberManager() {
  const workspaceSlug = useWorkspaceSlug();
  const { data: workspace } = useWorkspaceVerification(workspaceSlug);
  const { data: currentUser } = useAuth();
  const navigate = useNavigate();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { data, isLoading, isError } = useMembers(workspaceSlug);
  const updateMemberRoleMutation = useUpdateMemberRole(workspaceSlug);
  const removeMemberMutation = useRemoveMember(workspaceSlug);
  const revokeInvitationMutation = useRevokeInvitation(workspaceSlug);
  const leaveWorkspaceMutation = useLeaveWorkspace(workspaceSlug);

  const currentUserRole = (workspace?.role || 'member') as MemberRole;
  const currentUserId = currentUser?.id || '';

  if (isLoading || !workspaceSlug) {
    return (
      <div className='h-full overflow-y-auto p-6'>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className='h-6 w-40' />
            </CardTitle>
            <CardDescription>
              <Skeleton className='h-4 w-64' />
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <div className='space-y-3'>
              <Skeleton className='h-14 w-full' />
              <Skeleton className='h-14 w-full' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='h-full overflow-y-auto p-6'>
        <MemberList
          members={[]}
          invitations={[]}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          workspaceSlug={workspaceSlug!}
          onEdit={() => {}}
          onRemove={() => {}}
          onRevokeInvitation={() => {}}
          onLeave={() => setLeaveDialogOpen(true)}
        />
      </div>
    );
  }

  const members = data?.members || [];
  const invitations = data?.invitations || [];

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  const handleUpdateRole = (data: UpdateMemberRoleData) => {
    if (selectedMember) {
      updateMemberRoleMutation.mutate({
        userId: selectedMember.userId,
        data,
      });
      setSelectedMember(null);
    }
  };

  const handleRemove = (member: Member) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (selectedMember) {
      removeMemberMutation.mutate(selectedMember.userId);
      setSelectedMember(null);
      setRemoveDialogOpen(false);
    }
  };

  const handleRevokeInvitation = (invitation: PendingInvitation) => {
    revokeInvitationMutation.mutate(invitation.id);
  };

  const handleLeave = () => {
    leaveWorkspaceMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/workspaces');
      },
    });
  };

  return (
    <>
      <div className='h-full overflow-y-auto p-6'>
        <MemberList
          members={members}
          invitations={invitations}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          workspaceSlug={workspaceSlug!}
          onEdit={handleEdit}
          onRemove={handleRemove}
          onRevokeInvitation={handleRevokeInvitation}
          onLeave={() => setLeaveDialogOpen(true)}
        />
      </div>

      <EditMemberDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        member={selectedMember}
        onSubmit={handleUpdateRole}
        isSubmitting={updateMemberRoleMutation.isPending}
        currentUserRole={currentUserRole}
      />

      <LeaveTeamDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        onConfirm={handleLeave}
        isSubmitting={leaveWorkspaceMutation.isPending}
      />

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.name} from this
              workspace? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setRemoveDialogOpen(false);
                setSelectedMember(null);
              }}
              disabled={removeMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmRemove}
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

