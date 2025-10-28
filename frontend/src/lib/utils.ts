import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//* cookie utilities
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

export function setCookie(
  name: string,
  value: string,
  options?: { maxAgeSeconds?: number; path?: string },
) {
  try {
    const encodedValue = encodeURIComponent(value);
    const maxAge = options?.maxAgeSeconds ?? SEVEN_DAYS_IN_SECONDS;
    const path = options?.path ?? '/';
    document.cookie = `${name}=${encodedValue}; Max-Age=${maxAge}; Path=${path}`;
  } catch (error) {
    console.error('Error in setCookie', error);
  }
}

export function getCookie(name: string): string | undefined {
  try {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
      const [k, v] = cookie.split('=');
      if (k === name) {
        return decodeURIComponent(v ?? '');
      }
    }
  } catch (error) {
    console.error('Error in getCookie', error);
  }
  return undefined;
}

export function deleteCookie(name: string, options?: { path?: string }) {
  try {
    const path = options?.path ?? '/';
    document.cookie = `${name}=; Max-Age=0; Path=${path}`;
  } catch (error) {
    console.error('Error in deleteCookie', error);
  }
}

const LAST_WORKSPACE_COOKIE = 'lastWorkspaceSlug';

export function getLastWorkspaceSlugs(): {
  current?: string;
  previous?: string;
} {
  const raw = getCookie(LAST_WORKSPACE_COOKIE);
  if (!raw) return {};
  const [current, previous] = raw.split(',').filter(Boolean);
  return { current, previous };
}

export function updateLastWorkspaceCookie(nextCurrentSlug: string) {
  const { current: prevCurrent } = getLastWorkspaceSlugs();
  const previous =
    prevCurrent && prevCurrent !== nextCurrentSlug ? prevCurrent : undefined;
  const value = previous ? `${nextCurrentSlug},${previous}` : nextCurrentSlug;
  setCookie(LAST_WORKSPACE_COOKIE, value, {
    maxAgeSeconds: SEVEN_DAYS_IN_SECONDS,
  });
}
