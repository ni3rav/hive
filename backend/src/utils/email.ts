import { Resend } from 'resend';
import { env } from '../env';

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  const {
    to,
    subject,
    html,
    from = 'Hive <noreply@emails.ni3rav.me>',
  } = options;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      return [error, null] as const;
    }

    return [null, data] as const;
  } catch (error) {
    console.error('Email send exception:', error);
    return [error, null] as const;
  }
};
