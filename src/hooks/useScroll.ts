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

/** IntersectionObserver hook – adds `visible` class to elements with `fade-up` */
export function useFadeUpObserver(dep?: unknown): void {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 80);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    const raf = requestAnimationFrame(() => {
      document.querySelectorAll('.fade-up:not(.visible)').forEach((el) => observer.observe(el));
    });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
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
      { threshold: 0.5 }
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
