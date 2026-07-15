import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  Theme,
  ResolvedTheme,
  ThemeProviderConfig,
  ThemeContextValue,
  StorageAdapter,
} from './types';
import {
  resolveTheme,
  applyTheme,
  getSystemTheme,
  createCookieStorage,
  getThemeFromQueryParam,
} from './utils';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const DEFAULT_STORAGE_KEY = 'theme';

export interface ThemeProviderProps extends ThemeProviderConfig {
  children: ReactNode;
  attribute?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = DEFAULT_STORAGE_KEY,
  storage,
  enableSystem = true,
  attribute = 'data-theme',
  disableTransition = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }

    const urlTheme = getThemeFromQueryParam();
    if (urlTheme) {
      return urlTheme;
    }

    const storageAdapter = storage ?? createCookieStorage();
    const stored = storageAdapter.getItem(storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }

    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    getSystemTheme(),
  );

  const resolvedTheme = useMemo(
    () => resolveTheme(theme, systemTheme),
    [theme, systemTheme],
  );

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);

      const storageAdapter = storage ?? createCookieStorage();
      storageAdapter.setItem(storageKey, newTheme);

      const resolved = resolveTheme(newTheme, systemTheme);
      applyTheme(resolved, attribute, disableTransition);
    },
    [storage, storageKey, systemTheme, attribute, disableTransition],
  );

  useEffect(() => {
    applyTheme(resolvedTheme, attribute, disableTransition);
  }, [resolvedTheme, attribute, disableTransition]);

  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    const handler = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [enableSystem]);

  const value: ThemeContextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
