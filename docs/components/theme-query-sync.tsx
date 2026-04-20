"use client";

import { useEffect } from "react";
import { useDocsTheme } from "@/contexts/theme-context";

type QueryTheme = "light" | "dark";

function isQueryTheme(value: string | null): value is QueryTheme {
  return value === "light" || value === "dark";
}

export function ThemeQuerySync() {
  const { theme, setTheme } = useDocsTheme();

  useEffect(() => {
    const syncThemeFromUrl = () => {
      const incomingTheme = new URLSearchParams(window.location.search).get(
        "theme",
      );

      if (!isQueryTheme(incomingTheme)) {
        return;
      }

      if (theme !== incomingTheme) {
        setTheme(incomingTheme);
      }
    };

    syncThemeFromUrl();
    window.addEventListener("popstate", syncThemeFromUrl);
    return () => window.removeEventListener("popstate", syncThemeFromUrl);
  }, [setTheme, theme]);

  return null;
}
