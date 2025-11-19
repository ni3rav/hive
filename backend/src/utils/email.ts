import { Resend } from 'resend';
import { env } from '../env';
import logger from '../logger';

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
      logger.error(error, 'Email send error');
      return [error, null] as const;
    }

    return [null, data] as const;
  } catch (error) {
    logger.error(error, 'Email send exception');
    return [error, null] as const;
  }
};
