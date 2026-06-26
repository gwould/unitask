import Hero, { SocialProof } from '../components/Hero';
import JobsSection from '../components/JobsSection';
import Categories from '../components/Categories';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import PartnersStrip from '../components/PartnersStrip';
import PricingSection from '../components/PricingSection';
import FAQSection from '../components/FAQSection';
import CTABanner from '../components/CTABanner';

export default function HomePage() {
  return (
    <div className="home-page">
      <Hero />
      <SocialProof />

      <JobsSection />
      <Categories />

      <HowItWorks />
      <Features />

      <Testimonials />
      <PartnersStrip />

      <PricingSection />
      <FAQSection />
      <CTABanner />
    </div>
  );
}
