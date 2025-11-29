import FAQ from "@/components/faq";
import Features from "@/components/features";
import Hero from "@/components/hero";

export const metadata = {
  description:
    "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
};

export default function HomePage() {
  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <Hero badgeText="Just released v1! 🎉" />
      <Features />
      <FAQ />
    </main>
  );
}
