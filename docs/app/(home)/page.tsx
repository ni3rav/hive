import { Cta } from "@/components/cta";
import FAQ from "@/components/faq";
import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";

export const metadata = {
  description:
    "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
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
