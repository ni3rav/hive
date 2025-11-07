import {
  apiGetMembers,
  apiInviteMember,
  apiUpdateMemberRole,
  apiRemoveMember,
  apiRevokeInvitation,
  apiLeaveWorkspace,
} from '@/api/member';
import type {
  InviteMemberData,
  UpdateMemberRoleData,
  Member,
  PendingInvitation,
} from '@/types/member';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';

export function useMembers(workspaceSlug: string | undefined) {
  return useQuery({
    queryKey: QueryKeys.workspaceKeys().members(workspaceSlug || ''),
    queryFn: () => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }
      return apiGetMembers(workspaceSlug);
    },
    retry: false,
    enabled: !!workspaceSlug,
  });
}

export function useInviteMember(workspaceSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteMemberData) => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }
      return apiInviteMember(workspaceSlug, data);
    },
    onSuccess: () => {
      toast.success('Invitation sent');
      if (workspaceSlug) {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.workspaceKeys().members(workspaceSlug),
        });
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to send invitation'));
    },
  });
}

export function useUpdateMemberRole(workspaceSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateMemberRoleData;
    }) => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }
      return apiUpdateMemberRole(workspaceSlug, userId, data);
    },
    onSuccess: () => {
      toast.success('Member role updated');
      if (workspaceSlug) {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.workspaceKeys().members(workspaceSlug),
        });
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update member role'));
    },
  });
}

export function useRemoveMember(workspaceSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }
      return apiRemoveMember(workspaceSlug, userId);
    },
    onMutate: async (userId) => {
      if (!workspaceSlug) return { previous: undefined };
      const queryKey = QueryKeys.workspaceKeys().members(workspaceSlug);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<{
        members: Member[];
        invitations: PendingInvitation[];
      }>(queryKey);

      queryClient.setQueryData(queryKey, (old: { members: Member[]; invitations: PendingInvitation[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          members: old.members.filter((m: Member) => m.userId !== userId),
        };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success('Member removed');
    },
    onError: (error, _variables, context) => {
      toast.error(getErrorMessage(error, 'Failed to remove member'));
      if (context?.previous && workspaceSlug) {
        queryClient.setQueryData(
          QueryKeys.workspaceKeys().members(workspaceSlug),
          context.previous,
        );
      }
    },
    onSettled: () => {
      if (workspaceSlug) {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.workspaceKeys().members(workspaceSlug),
        });
      }
    },
  });
}

export function useRevokeInvitation(workspaceSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }
      return apiRevokeInvitation(workspaceSlug, invitationId);
    },
    onMutate: async (invitationId) => {
      if (!workspaceSlug) return { previous: undefined };
      const queryKey = QueryKeys.workspaceKeys().members(workspaceSlug);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<{
        members: Member[];
        invitations: PendingInvitation[];
      }>(queryKey);

      queryClient.setQueryData(queryKey, (old: { members: Member[]; invitations: PendingInvitation[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          invitations: old.invitations.filter((i) => i.id !== invitationId),
        };
      });
      return { previous };
    },
    onSuccess: () => {
      toast.success('Invitation revoked');
    },
    onError: (error, _variables, context) => {
      toast.error(getErrorMessage(error, 'Failed to revoke invitation'));
      if (context?.previous && workspaceSlug) {
        queryClient.setQueryData(
          QueryKeys.workspaceKeys().members(workspaceSlug),
          context.previous,
        );
      }
    },
    onSettled: () => {
      if (workspaceSlug) {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.workspaceKeys().members(workspaceSlug),
        });
      }
    },
  });
}

export function useLeaveWorkspace(workspaceSlug: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!workspaceSlug) {
        throw new Error('Workspace slug is required');
      }
      return apiLeaveWorkspace(workspaceSlug);
    },
    onSuccess: () => {
      toast.success('Left workspace');
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workspaceKeys().list(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to leave workspace'));
    },
  });
}

