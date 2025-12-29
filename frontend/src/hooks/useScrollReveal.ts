import { useRef, useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Simplified scroll reveal hook using Intersection Observer
 * Apple-style: fade-up with subtle ease-out
 */
export function useScrollReveal<T extends HTMLElement>(
  options: {
    threshold?: number;
    rootMargin?: string;
    delay?: number;
  } = {}
) {
  const ref = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();
  const { threshold = 0.2, rootMargin = '0px', delay = 0 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    // Initial hidden state
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = `opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms, transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            observer.unobserve(element);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, delay, prefersReducedMotion]);

  return ref;
}

/**
 * Hook for staggered children reveal using CSS classes
 */
export function useStaggeredReveal<T extends HTMLElement>(
  childSelector: string,
  staggerMs = 80
) {
  const containerRef = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.querySelectorAll(childSelector);

    if (prefersReducedMotion) {
      children.forEach((child) => {
        (child as HTMLElement).style.opacity = '1';
        (child as HTMLElement).style.transform = 'none';
      });
      return;
    }

    // Set initial state
    children.forEach((child, index) => {
      const el = child as HTMLElement;
      el.style.opacity = '0';
      el.style.transform = 'translateY(25px)';
      el.style.transition = `opacity 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${index * staggerMs}ms, transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) ${index * staggerMs}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            children.forEach((child) => {
              const el = child as HTMLElement;
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            });
            observer.unobserve(container);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [childSelector, staggerMs, prefersReducedMotion]);

  return containerRef;
}
