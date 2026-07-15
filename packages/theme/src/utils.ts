import type { Theme, ResolvedTheme, StorageAdapter } from './types';

const DEFAULT_STORAGE_KEY = 'theme';
const DEFAULT_ATTRIBUTE = 'data-theme';

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function resolveTheme(
  theme: Theme,
  systemTheme?: ResolvedTheme,
): ResolvedTheme {
  if (theme === 'system') {
    return systemTheme ?? getSystemTheme();
  }
  return theme;
}

export function applyTheme(
  theme: ResolvedTheme,
  attribute: string = DEFAULT_ATTRIBUTE,
  disableTransition: boolean = false,
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  if (disableTransition) {
    root.style.setProperty('transition', 'none');
  }

  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.setAttribute(attribute, theme);

  if (disableTransition) {
    requestAnimationFrame(() => {
      root.style.removeProperty('transition');
    });
  }
}

export function createCookieStorage(): StorageAdapter {
  return {
    getItem: (key: string): string | null => {
      if (typeof document === 'undefined') {
        return null;
      }
      const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
      return match ? decodeURIComponent(match[2]) : null;
    },
    setItem: (key: string, value: string): void => {
      if (typeof document === 'undefined') {
        return;
      }
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    },
    removeItem: (key: string): void => {
      if (typeof document === 'undefined') {
        return;
      }
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    },
  };
}

export function createLocalStorageAdapter(): StorageAdapter {
  return {
    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') {
        return null;
      }
      return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.setItem(key, value);
    },
    removeItem: (key: string): void => {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.removeItem(key);
    },
  };
}

export function getThemeFromQueryParam(paramName: string = 'theme'): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const value = new URLSearchParams(window.location.search).get(paramName);
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return null;
}
