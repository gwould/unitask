import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import SearchSection from '../components/SearchSection';
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
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleQuickSearch = (tag: string) => {
    setSearchValue(tag);
    navigate(`/jobs?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="home-page">
      {/* 1. Thu hut — Hero + Trust */}
      <Hero />
      <TrustStrip />

      {/* 2. Hanh dong — Tim viec ngay */}
      <SearchSection
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        onSearch={handleSearch}
        onQuickSearch={handleQuickSearch}
      />

      {/* 3. Chung minh — Job thuc te + Nganh nghe */}
      <JobsSection />
      <Categories />

      {/* 4. Giai thich — Cach hoat dong + Tinh nang */}
      <HowItWorks />
      <Features />

      {/* 5. Tin tuong — Danh gia + Doi tac */}
      <Testimonials />
      <PartnersStrip />

      {/* 6. Chuyen doi — Bang gia + FAQ + CTA */}
      <PricingSection />
      <FAQSection />
      <CTABanner />
    </div>
  );
}
