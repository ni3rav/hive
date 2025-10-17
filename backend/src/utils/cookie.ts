import { Response } from 'express';
import { env } from '../env';

export const SESSION_COOKIE_NAME = 'session_id';
export const WORKSPACE_COOKIE_NAME = 'workspace_id';

export interface CookieOptions {
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  secure: boolean;
  expires: Date;
}

function getSessionCookieOptions(expiresAt: Date): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    expires: expiresAt,
  };
}

export function setSessionCookie(
  res: Response,
  sessionId: string,
  expiresAt: Date,
): void {
  res.cookie(
    SESSION_COOKIE_NAME,
    sessionId,
    getSessionCookieOptions(expiresAt),
  );
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
  });
}
function getWorkspaceCookieOptions(expiresAt?: Date): CookieOptions {
  const expires = expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    expires,
  };
}

export function setWorkspaceCookie(
  res: Response,
  workspaceId: string,
  expiresAt?: Date,
): void {
  res.cookie(
    WORKSPACE_COOKIE_NAME,
    workspaceId,
    getWorkspaceCookieOptions(expiresAt),
  );
}

export function clearWorkspaceCookie(res: Response): void {
  res.clearCookie(WORKSPACE_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
  });
}