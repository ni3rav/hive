import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Hive API Docs",
      url: "/docs",
    },
    links: [
      {
        text: "Go Home",
        url: "/",
      },
    ],
  };
}
