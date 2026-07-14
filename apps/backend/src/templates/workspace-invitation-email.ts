import { env } from '../env';
import { baseTemplate } from './base-template';
import {
  headingStyles,
  textStyles,
  buttonStyles,
  dividerStyles,
  colors,
} from './email-styles';

interface WorkspaceInvitationEmailProps {
  workspaceName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  invitationLink: string;
}

export const EMAIL_FROM = `Hive <noreply@${env.EMAIL_DOMAIN}>`;

export const workspaceInvitationEmail = ({
  workspaceName,
  inviterName,
  inviterEmail,
  role,
  invitationLink,
}: WorkspaceInvitationEmailProps) => {
  const content = `
    <h2 style="${headingStyles}">You've been invited to ${workspaceName}</h2>
    
    <p style="${textStyles}">
      Hi there,
    </p>
    
    <p style="${textStyles}">
      <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join the <strong>${workspaceName}</strong> workspace as a <strong>${role}</strong>.
    </p>
    
    <div style="text-align: center;">
      <a href="${invitationLink}" style="${buttonStyles}">
        Accept Invitation
      </a>
    </div>
    
    <p style="${textStyles}">
      This invitation link will expire in 7 days. Once you accept, you'll be able to collaborate with your team on this workspace.
    </p>
    
    <hr style="${dividerStyles}">
    
    <p style="${textStyles} font-size: 13px; color: ${colors.mutedForeground};">
      If you didn't expect this invitation, you can safely ignore this email.
    </p>
    
    <p style="${textStyles} font-size: 13px; color: ${colors.mutedForeground};">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${invitationLink}" style="color: ${colors.secondary}; word-break: break-all;">${invitationLink}</a>
    </p>
  `;

  return baseTemplate({
    content,
    preheader: `You've been invited to join ${workspaceName}`,
  });
};
