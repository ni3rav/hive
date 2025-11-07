import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api-client';
import type {
  Member,
  PendingInvitation,
  InviteMemberData,
  UpdateMemberRoleData,
} from '@/types/member';

export async function apiGetMembers(
  workspaceSlug: string,
): Promise<{ members: Member[]; invitations: PendingInvitation[] }> {
  return apiGet<{ members: Member[]; invitations: PendingInvitation[] }>(
    `/api/workspace/${workspaceSlug}/members`,
  );
}

export async function apiInviteMember(
  workspaceSlug: string,
  data: InviteMemberData,
): Promise<void> {
  return apiPost<void, InviteMemberData>(
    `/api/workspace/${workspaceSlug}/members/invite`,
    data,
  );
}

export async function apiUpdateMemberRole(
  workspaceSlug: string,
  userId: string,
  data: UpdateMemberRoleData,
): Promise<Member> {
  return apiPatch<Member, UpdateMemberRoleData>(
    `/api/workspace/${workspaceSlug}/members/${userId}`,
    data,
  );
}

export async function apiRemoveMember(
  workspaceSlug: string,
  userId: string,
): Promise<void> {
  return apiDelete<void>(`/api/workspace/${workspaceSlug}/members/${userId}`);
}

export async function apiRevokeInvitation(
  workspaceSlug: string,
  invitationId: string,
): Promise<void> {
  return apiDelete<void>(
    `/api/workspace/${workspaceSlug}/members/invitations/${invitationId}`,
  );
}

export async function apiLeaveWorkspace(
  workspaceSlug: string,
): Promise<void> {
  return apiDelete<void>(`/api/workspace/${workspaceSlug}/members/leave`);
}

