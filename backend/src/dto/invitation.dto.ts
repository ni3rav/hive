export interface InvitationDetailsResponseDto {
  workspaceName: string;
  inviterEmail: string;
  inviterName: string;
  inviteeEmail: string;
  role: string;
  workspaceSlug: string;
  expiresAt?: string;
}

export interface AcceptInvitationResponseDto {
  workspaceSlug: string;
}

export function toInvitationDetailsResponseDto(data: {
  workspaceName: string;
  inviterEmail: string;
  inviterName: string;
  inviteeEmail: string;
  role: string;
  workspaceSlug: string;
  expiresAt?: Date | null;
}): InvitationDetailsResponseDto {
  return {
    workspaceName: data.workspaceName,
    inviterEmail: data.inviterEmail,
    inviterName: data.inviterName,
    inviteeEmail: data.inviteeEmail,
    role: data.role,
    workspaceSlug: data.workspaceSlug,
    expiresAt: data.expiresAt?.toISOString(),
  };
}

export function toAcceptInvitationResponseDto(data: {
  workspaceSlug: string;
}): AcceptInvitationResponseDto {
  return {
    workspaceSlug: data.workspaceSlug,
  };
}
