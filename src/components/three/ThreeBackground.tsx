import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { initNetworkScene, type NetworkSceneOptions } from './sceneFactory';
import { initHomeScene } from './homeSceneFactory';
import { initGlobeScene } from './globeSceneFactory';
import { initJobsScene } from './jobsSceneFactory';

export type ThreeBackgroundVariant =
  | 'home'
  | 'hero'
  | 'jobs'
  | 'dashboard'
  | 'auth'
  | 'cta'
  | 'globe';

const NETWORK_PRESETS: Record<string, NetworkSceneOptions> = {
  hero: {
    particleCount: 95,
    connectionDistance: 6.5,
    showShapes: true,
    mouseParallax: true,
    lineOpacity: 0.16,
    particleSize: 0.34,
  },
  dashboard: {
    particleCount: 65,
    connectionDistance: 5.5,
    showShapes: false,
    mouseParallax: false,
    lineOpacity: 0.09,
    particleSize: 0.26,
  },
  auth: {
    particleCount: 55,
    connectionDistance: 5,
    showShapes: false,
    mouseParallax: false,
    lineOpacity: 0.1,
    particleSize: 0.28,
  },
  cta: {
    particleCount: 45,
    connectionDistance: 5.5,
    showShapes: false,
    mouseParallax: false,
    lineOpacity: 0.12,
    particleSize: 0.26,
  },
};

type ThreeBackgroundProps = {
  className?: string;
  variant?: ThreeBackgroundVariant;
};

export default function ThreeBackground({ className = '', variant = 'home' }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    if (variant === 'home' || variant === 'hero') {
      const handle = initHomeScene(container, {
        particleCount: 130,
        connectionDistance: 7.2,
        lineOpacity: 0.2,
        particleSize: 0.4,
        mouseParallax: true,
        showGlobe: true,
        globeScale: 1.05,
      });
      return () => handle.dispose();
    }

    if (variant === 'jobs') {
      const handle = initJobsScene(container);
      return () => handle.dispose();
    }

    if (variant === 'globe') {
      const handle = initGlobeScene(container, {
        radius: 5,
        mouseParallax: true,
        rotationSpeed: 0.004,
      });
      return () => handle.dispose();
    }

    const preset = NETWORK_PRESETS[variant] ?? NETWORK_PRESETS.hero;
    const handle = initNetworkScene(container, preset);
    return () => handle.dispose();
  }, [reducedMotion, variant]);

  if (reducedMotion) {
    return <div className={`three-fallback ${className}`.trim()} aria-hidden />;
  }

  return (
    <div
      ref={containerRef}
      className={`three-canvas-wrap ${className}`.trim()}
      aria-hidden
    />
  );
}
