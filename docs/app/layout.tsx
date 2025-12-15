import { RootProvider } from "fumadocs-ui/provider/next";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import "./global.css";
import { Geist } from "next/font/google";
import type { Metadata } from "next";
import {
  generateOrganizationData,
  generateWebSiteData,
} from "@/lib/structured-data";

const geist = Geist({
  subsets: ["latin"],
});

const baseUrl = "https://hivecms.online";

const siteConfig = {
  name: "Hive",
  title: "Hive | A simple CMS for your next project",
  description:
    "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
  url: baseUrl,
  ogImage: `${baseUrl}/og.png`,
  links: {
    twitter: "https://twitter.com/ni3rav",
    github: "https://github.com/ni3rav/hive",
  },
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: "%s | Hive",
  },
  description: siteConfig.description,
  metadataBase: new URL(baseUrl),
  applicationName: siteConfig.name,
  authors: [{ name: "Nirav", url: "https://github.com/ni3rav" }],
  creator: "Nirav",
  publisher: "Nirav",
  keywords: [
    "headless cms",
    "content management system",
    "cms",
    "nextjs cms",
    "react cms",
    "api-first cms",
    "content api",
    "blog cms",
    "portfolio cms",
    "typescript cms",
    "modern cms",
    "developer tools",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Hive - A simple CMS for your next project",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@ni3rav",
    site: "@ni3rav",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "", // Add your Google Search Console verification code here
  },
  alternates: {
    canonical: baseUrl,
  },
  category: "technology",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const organizationData = generateOrganizationData();
  const websiteData = generateWebSiteData();

  return (
    <html lang="en" className={geist.className} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <RootProvider>{children}</RootProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
