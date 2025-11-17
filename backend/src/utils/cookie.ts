import { Response } from 'express';
import { env } from '../env';

export const COOKIE_NAME = 'session_id';

function getSessionCookieOptions(expiresAt: Date) {
  const options: {
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    secure: boolean;
    expires: Date;
    path: string;
    partitioned?: boolean;
  } = {
    httpOnly: true,
    sameSite: 'none',
    secure: env.isProduction,
    expires: expiresAt,
    path: '/',
    ...(env.isProduction && { partitioned: true }),
  };

  return options;
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'none' as 'strict' | 'lax' | 'none',
    secure: env.isProduction,
    path: '/',
    ...(env.isProduction && { partitioned: true }),
  };
}

export function setSessionCookie(
  res: Response,
  sessionId: string,
  expiresAt: Date,
): void {
  const options = getSessionCookieOptions(expiresAt);
  res.cookie(COOKIE_NAME, sessionId, options);

  if (options.partitioned && env.isProduction) {
    const setCookieHeader = res.getHeader('Set-Cookie');
    if (setCookieHeader) {
      const headers = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];
      const updatedHeaders = headers.map((header) => {
        const headerStr = String(header);
        if (headerStr.includes(`${COOKIE_NAME}=`)) {
          if (!headerStr.includes('Partitioned')) {
            return `${headerStr}; Partitioned`;
          }
        }
        return headerStr;
      });
      res.setHeader('Set-Cookie', updatedHeaders);
    }
  }
}

export function clearSessionCookie(res: Response): void {
  const options = getCookieOptions();
  res.clearCookie(COOKIE_NAME, options);
}
