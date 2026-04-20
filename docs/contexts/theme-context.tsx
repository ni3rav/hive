"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const THEME_STORAGE_KEY = "docs-theme";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function getThemeFromUrl(): Theme | null {
  const value = new URLSearchParams(window.location.search).get("theme");
  return value === "light" || value === "dark" ? value : null;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const fromUrl = getThemeFromUrl();
  if (fromUrl) {
    return fromUrl;
  }

  const fromStorage = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (fromStorage === "light" || fromStorage === "dark") {
    return fromStorage;
  }

  return "dark";
}

export function DocsThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useDocsTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useDocsTheme must be used within DocsThemeProvider");
  }
  return context;
}
