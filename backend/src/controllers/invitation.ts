import { Request, Response } from 'express';
import { getInvitationByToken, acceptInvitation } from '../utils/member';
import { invitationTokenSchema } from '../utils/validations/member';
import {
  ok,
  validationError,
  serverError,
  notFound,
  forbidden,
  conflict,
} from '../utils/responses';
import logger from '../logger';
import {
  toInvitationDetailsResponseDto,
  toAcceptInvitationResponseDto,
} from '../dto/invitation.dto';

export async function getInvitationDetailsController(
  req: Request,
  res: Response,
) {
  const parse = invitationTokenSchema.safeParse({
    token: req.params.token,
  });

  if (!parse.success) {
    return validationError(res, 'Invalid token', parse.error.issues);
  }

  try {
    const [err, invitation] = await getInvitationByToken(parse.data.token);

    if (err) {
      const msg = (err as Error).message;
      if (msg === 'invitation not found' || msg === 'invitation not pending') {
        return notFound(res, 'Invitation not found or already processed');
      }
      if (msg === 'invitation expired') {
        return conflict(res, 'Invitation has expired');
      }
      return serverError(res, 'Failed to fetch invitation details');
    }

    if (!invitation || !invitation.workspace || !invitation.invitedByUser) {
      return serverError(res, 'Failed to fetch invitation details');
    }

    const invitationDetails = toInvitationDetailsResponseDto({
      workspaceName: invitation.workspace.name,
      inviterEmail: invitation.invitedByUser.email,
      inviterName:
        invitation.invitedByUser.name || invitation.invitedByUser.email,
      inviteeEmail: invitation.email,
      role: invitation.role,
      workspaceSlug: invitation.workspace.slug,
      expiresAt: invitation.expiresAt,
    });

    return ok(res, 'Invitation details fetched', invitationDetails);
  } catch (error) {
    logger.error(error, 'Error fetching invitation details');
    return serverError(res, 'Failed to fetch invitation details');
  }
}

export async function acceptInvitationController(req: Request, res: Response) {
  const parse = invitationTokenSchema.safeParse({
    token: req.params.token,
  });

  if (!parse.success) {
    return validationError(res, 'Invalid token', parse.error.issues);
  }

  const userId = req.userId;

  if (!userId) {
    return forbidden(res, 'Authentication required');
  }

  try {
    const [err, result] = await acceptInvitation(parse.data.token, userId);

    if (err) {
      const msg = (err as Error).message;
      if (msg === 'invitation not found' || msg === 'invitation not pending') {
        return notFound(res, 'Invitation not found or already processed');
      }
      if (msg === 'invitation expired') {
        return conflict(res, 'Invitation has expired');
      }
      if (msg === 'email mismatch') {
        return forbidden(res, 'Email address does not match invitation');
      }
      if (msg === 'user already a member') {
        return conflict(res, 'You are already a member of this workspace');
      }
      if (msg === 'user not found') {
        return notFound(res, 'User not found');
      }
      return serverError(res, 'Failed to accept invitation');
    }

    if (!result) {
      return serverError(res, 'Failed to accept invitation');
    }

    const acceptInvitationResponse = toAcceptInvitationResponseDto(result);

    return ok(res, 'Invitation accepted', acceptInvitationResponse);
  } catch (error) {
    logger.error(error, 'Error accepting invitation');
    return serverError(res, 'Failed to accept invitation');
  }
}
