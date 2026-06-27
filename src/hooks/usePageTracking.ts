import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = 'G-072SW8RG9C';

/**
 * Gửi sự kiện page_view tới Google Analytics mỗi khi route thay đổi (SPA).
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    const pagePath = location.pathname + location.search + location.hash;
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);
}
