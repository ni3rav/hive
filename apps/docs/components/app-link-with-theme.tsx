"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ComponentProps } from "react";
import { useDocsTheme } from "@/contexts/theme-context";

type LinkProps = ComponentProps<typeof Link>;

function withThemeQuery(href: string, theme: "light" | "dark") {
  try {
    const url = new URL(href);
    url.searchParams.set("theme", theme);
    const hasOnlyOriginPath = url.pathname === "/" && !url.hash;

    if (hasOnlyOriginPath) {
      return `${url.origin}?${url.searchParams.toString()}`;
    }

    return url.toString();
  } catch {
    return href;
  }
}

export function AppLinkWithTheme({ href, ...props }: LinkProps) {
  const { theme } = useDocsTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themedHref = useMemo(() => {
    if (typeof href !== "string") {
      return href;
    }
    if (!mounted) {
      return href;
    }
    return withThemeQuery(href, theme);
  }, [href, mounted, theme]);

  return <Link href={themedHref} {...props} />;
}
