import HeroSection from '@/components/LandingPage/hero-section';
import { Features } from '@/components/LandingPage/Features';
import Footer from '@/components/LandingPage/Footer';
import { HeroHeader } from '@/components/LandingPage/header';
import { PageReveal } from '@/components/PageReveal';

export default function LandingPage() {
  return (
    <div className='flex flex-col min-h-screen bg-background'>
      <PageReveal />
      <HeroHeader />
      <main className='flex flex-col flex-1 min-w-screen'>
        <HeroSection />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
