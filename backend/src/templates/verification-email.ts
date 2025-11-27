import { env } from '../env';
import { baseTemplate } from './base-template';
import {
  headingStyles,
  textStyles,
  buttonStyles,
  dividerStyles,
  colors,
} from './email-styles';

interface VerificationEmailProps {
  name: string;
  verificationLink: string;
}

export const EMAIL_FROM = `Hive <onboarding@${env.EMAIL_DOMAIN}>`;

export const verificationEmail = ({
  name,
  verificationLink,
}: VerificationEmailProps) => {
  const content = `
    <h2 style="${headingStyles}">Welcome to Hive, ${name}!</h2>
    
    <p style="${textStyles}">
      Thank you for signing up. We're excited to have you on board! To get started, please verify your email address by clicking the button below.
    </p>
    
    <div style="text-align: center;">
      <a href="${verificationLink}" style="${buttonStyles}">
        Verify Email Address
      </a>
    </div>
    
    <p style="${textStyles}">
      This verification link will expire in 24 hours for security reasons.
    </p>
    
    <hr style="${dividerStyles}">
    
    <p style="${textStyles} font-size: 13px; color: ${colors.mutedForeground};">
      If you didn't create an account with Hive, you can safely ignore this email.
    </p>
    
    <p style="${textStyles} font-size: 13px; color: ${colors.mutedForeground};">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${verificationLink}" style="color: ${colors.secondary}; word-break: break-all;">${verificationLink}</a>
    </p>
  `;

  return baseTemplate({
    content,
    preheader: 'Verify your email address to get started with Hive',
  });
};
