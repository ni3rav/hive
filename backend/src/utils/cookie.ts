import { Response } from 'express';
import { env } from '../env';

export const COOKIE_NAME = 'session_id';

export interface CookieOptions {
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  secure: boolean;
  expires: Date;
}

function getSessionCookieOptions(expiresAt: Date): CookieOptions {
  return {
    httpOnly: true,
    sameSite: env.isProduction ? 'none' : 'lax',
    secure: env.isProduction,
    expires: expiresAt,
  };
}

export function setSessionCookie(
  res: Response,
  sessionId: string,
  expiresAt: Date,
): void {
  res.cookie(COOKIE_NAME, sessionId, getSessionCookieOptions(expiresAt));
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
  });
}
