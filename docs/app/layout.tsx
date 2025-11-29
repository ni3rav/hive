import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Geist } from "next/font/google";
import type { Metadata } from "next";

const geist = Geist({
  subsets: ["latin"],
});

const baseUrl = "https://hivecms.online";

export const metadata: Metadata = {
  title: {
    default: "Hive | A simple CMS for your next project",
    template: "%s | Hive",
  },
  description:
    "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
  metadataBase: new URL(baseUrl),
  applicationName: "Hive",
  authors: [{ name: "Nirav", url: "https://github.com/ni3rav" }],
  creator: "Nirav",
  publisher: "Nirav",
  keywords: ["headless cms", "content management", "nextjs", "react", "cms"],
  openGraph: {
    title: "Hive | A simple CMS for your next project",
    description:
      "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
    url: baseUrl,
    siteName: "Hive",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/hive.png",
        width: 1200,
        height: 630,
        alt: "Hive CMS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hive | A simple CMS for your next project",
    description:
      "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
    images: ["/hive.png"],
    creator: "@ni3rav",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
