import { HeroSection } from '@/components/LandingPage/hero-section';
import { FeaturesSection } from '@/components/LandingPage/Features';
import { Footer } from '@/components/LandingPage/Footer';
import { Header } from '@/components/LandingPage/header';
import { PageReveal } from '@/components/PageReveal';
import { useHead } from '@unhead/react';
import { createLandingPageSEOMetadata } from '@/lib/seo';
import { FAQSection } from '@/components/LandingPage/FaqSection';
import { CTASection } from '@/components/LandingPage/CTASection';

export default function LandingPage() {
  useHead(createLandingPageSEOMetadata());

  return (
    <div className='flex flex-col min-h-screen bg-background'>
      <PageReveal />
      <Header />
      <main className='flex flex-col flex-1 min-w-screen'>
        <HeroSection />
        <FeaturesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
