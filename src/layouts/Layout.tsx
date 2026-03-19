import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useFadeUpObserver } from '../hooks/useScroll';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

export default function Layout() {
  const { pathname } = useLocation();

  // scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  // re-apply fade-up observer on route change
  useFadeUpObserver(pathname);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
