import { useEffect, useState, type RefObject } from 'react';

/** Returns true once the user scrolls past `threshold` pixels */
export function useScrolled(threshold = 60): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);
  return scrolled;
}

/** Returns the id of the currently-visible section */
export function useActiveSection(ids: string[], offset = 120): string {
  const [active, setActive] = useState('');
  useEffect(() => {
    const handler = () => {
      let cur = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - offset) cur = id;
      }
      setActive(cur);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, [ids, offset]);
  return active;
}

/** Scan and observe all `.fade-up` elements not yet visible. */
export function observeFadeUpElements(): void {
  const els = document.querySelectorAll<HTMLElement>('.fade-up:not(.visible)');
  if (els.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        setTimeout(() => el.classList.add('visible'), i * 60);
        io.unobserve(el);
      });
    },
    { threshold: 0.08, rootMargin: '40px 0px' },
  );

  els.forEach((el) => io.observe(el));
}

/** IntersectionObserver – adds `visible` to `.fade-up` (incl. async-loaded content). */
export function useFadeUpObserver(dep?: unknown): void {
  useEffect(() => {
    const run = () => observeFadeUpElements();

    const raf = requestAnimationFrame(run);

    // Re-scan when DOM gains new nodes (e.g. jobs/categories loaded from API)
    const mutation = new MutationObserver(() => {
      requestAnimationFrame(run);
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mutation.disconnect();
    };
  }, [dep]);
}

/** Animated counter: counts from 0 to target */
export function useCounterObserver(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const nums = element.querySelectorAll<HTMLElement>('.stat-num');
            animateCounter(nums[0], 12, 'K+');
            animateCounter(nums[1], 850, '+');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}

function animateCounter(el: HTMLElement | undefined, target: number, _suffix: string) {
  if (!el) return;
  let start = 0;
  const step = target / 60;
  const firstChild = el.firstChild;
  if (!firstChild) return;
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    firstChild.textContent = Math.floor(start).toLocaleString('vi-VN');
  }, 25);
}
