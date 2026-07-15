export type Theme = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface ThemeProviderConfig {
  defaultTheme?: Theme;
  storageKey?: string;
  storage?: StorageAdapter;
  enableSystem?: boolean;
  attribute?: string;
  disableTransition?: boolean;
}

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}
