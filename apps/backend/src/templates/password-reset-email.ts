import { env } from '../env';
import { baseTemplate } from './base-template';
import {
  headingStyles,
  textStyles,
  buttonStyles,
  dividerStyles,
  colors,
} from './email-styles';

interface PasswordResetEmailProps {
  name: string;
  resetLink: string;
}

export const EMAIL_FROM = `Hive Security <security@${env.EMAIL_DOMAIN}>`;

export const passwordResetEmail = ({
  name,
  resetLink,
}: PasswordResetEmailProps) => {
  const content = `
    <h2 style="${headingStyles}">Reset Your Password</h2>
    
    <p style="${textStyles}">
      Hi ${name},
    </p>
    
    <p style="${textStyles}">
      We received a request to reset the password for your Hive account. Click the button below to create a new password.
    </p>
    
    <div style="text-align: center;">
      <a href="${resetLink}" style="${buttonStyles}">
        Reset Password
      </a>
    </div>
    
    <p style="${textStyles}">
      This password reset link will expire in 1 hour for security reasons.
    </p>
    
    <hr style="${dividerStyles}">
    
    <p style="${textStyles} font-size: 13px; color: ${colors.mutedForeground};">
      If you didn't request a password reset, please ignore this email or contact support if you have concerns. Your password will remain unchanged.
    </p>
    
    <p style="${textStyles} font-size: 13px; color: ${colors.mutedForeground};">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetLink}" style="color: ${colors.secondary}; word-break: break-all;">${resetLink}</a>
    </p>
  `;

  return baseTemplate({
    content,
    preheader: 'Reset your Hive account password',
  });
};
