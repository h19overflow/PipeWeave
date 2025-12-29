/**
 * useTableAnimation - Hook for staggered table row reveal animations
 * Uses GSAP for timeline-based row entrance with scroll awareness
 */
import { useRef, useLayoutEffect, useCallback } from 'react';
import { gsap } from 'gsap';

interface UseTableAnimationOptions {
  staggerDelay?: number;
  rowDuration?: number;
  startDelay?: number;
  ease?: string;
}

export function useTableAnimation<T extends HTMLElement>(
  rowCount: number,
  options: UseTableAnimationOptions = {}
) {
  const {
    staggerDelay = 0.08,
    rowDuration = 0.5,
    startDelay = 0.4,
    ease = 'power3.out',
  } = options;

  const containerRef = useRef<T>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasAnimated = useRef(false);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || hasAnimated.current) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rows = container.querySelectorAll('[data-table-row]');
    if (rows.length === 0) return;

    gsap.set(rows, {
      opacity: 0,
      y: 20,
      scale: 0.98,
    });

    timelineRef.current = gsap.timeline({
      delay: startDelay,
      onComplete: () => {
        hasAnimated.current = true;
      },
    });

    timelineRef.current.to(rows, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: rowDuration,
      stagger: staggerDelay,
      ease,
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [rowCount, staggerDelay, rowDuration, startDelay, ease]);

  const resetAnimation = useCallback(() => {
    hasAnimated.current = false;
    if (timelineRef.current) {
      timelineRef.current.restart();
    }
  }, []);

  return { containerRef, resetAnimation };
}

export function useRowHoverAnimation() {
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLTableRowElement>) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.to(e.currentTarget, {
      y: -2,
      boxShadow: '0 4px 20px rgba(55, 19, 236, 0.15)',
      duration: 0.2,
      ease: 'power2.out',
    });
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLTableRowElement>) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.to(e.currentTarget, {
      y: 0,
      boxShadow: 'none',
      duration: 0.2,
      ease: 'power2.out',
    });
  }, []);

  return { handleMouseEnter, handleMouseLeave };
}
