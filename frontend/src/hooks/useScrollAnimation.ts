import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationConfig {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

/**
 * Hook for scroll-triggered fade-in animations
 */
export function useScrollFadeIn<T extends HTMLElement>(
  config: ScrollAnimationConfig = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(element, { opacity: 0, y: 40 });

    const trigger = ScrollTrigger.create({
      trigger: config.trigger || element,
      start: config.start || 'top 85%',
      end: config.end || 'bottom 15%',
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        });
        config.onEnter?.();
      },
      ...config,
    });

    return () => {
      trigger.kill();
    };
  }, [config]);

  return ref;
}

/**
 * Hook for staggered children animations
 */
export function useStaggerReveal<T extends HTMLElement>(
  selector: string,
  staggerDelay = 0.1
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const children = container.querySelectorAll(selector);

    if (prefersReducedMotion) {
      gsap.set(children, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(children, { opacity: 0, y: 30 });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: staggerDelay,
          ease: 'power2.out',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [selector, staggerDelay]);

  return containerRef;
}

/**
 * Hook for horizontal scroll sections
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const scrollWidth = content.scrollWidth - container.clientWidth;

    const tween = gsap.to(content, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${scrollWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return { containerRef, contentRef };
}

/**
 * Hook for parallax effects
 */
export function useParallax<T extends HTMLElement>(speed = 0.5) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const tween = gsap.to(element, {
      y: () => window.innerHeight * speed * -1,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [speed]);

  return ref;
}

/**
 * Hook for text reveal animations
 */
export function useTextReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const animate = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' });
      return;
    }

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 60,
        clipPath: 'inset(100% 0 0 0)',
      },
      {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0 0)',
        duration: 1,
        ease: 'power3.out',
      }
    );
  }, []);

  return { ref, animate };
}

/**
 * Cleanup all ScrollTrigger instances
 */
export function cleanupScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
