import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import Categories from '../components/Categories';
import SearchSection from '../components/SearchSection';
import JobsSection from '../components/JobsSection';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
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
    <>
      <Hero />
      <TrustStrip />
      <Categories />
      <SearchSection
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        onSearch={handleSearch}
        onQuickSearch={handleQuickSearch}
      />
      <JobsSection />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTABanner />
    </>
  );
}
