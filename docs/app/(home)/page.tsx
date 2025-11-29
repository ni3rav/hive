import { Cta } from "@/components/cta";
import FAQ from "@/components/faq";
import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import type { Metadata } from "next";
import { generateStructuredData } from "@/lib/structured-data";

const baseUrl = "https://hivecms.online";

export const metadata: Metadata = {
  title: "Hive | A simple CMS for your next project",
  description:
    "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Hive | A simple CMS for your next project",
    description:
      "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
    type: "website",
    url: baseUrl,
    siteName: "Hive",
    locale: "en_US",
    images: [
      {
        url: `${baseUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: "Hive - A simple CMS for your next project",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hive | A simple CMS for your next project",
    description:
      "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
    images: [`${baseUrl}/og.png`],
    creator: "@ni3rav",
    site: "@ni3rav",
  },
};

export default function HomePage() {
  const structuredData = generateStructuredData();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <Hero badgeText="Just released v1! 🎉" />
      <Features />
      <FAQ />
      <Cta
        heading="Ready to get started?"
        description="Get started with Hive today and start managing your content the smart way."
        buttons={{
          primary: {
            text: "Get Started",
            url: "https://app.hivecms.com/login",
          },
        }}
      />
      <Footer />
    </main>
  );
}
