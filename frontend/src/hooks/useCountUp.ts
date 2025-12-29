import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from './useReducedMotion';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  easing?: string;
  onComplete?: () => void;
}

interface UseCountUpReturn {
  value: string;
  start: () => void;
  reset: () => void;
  isAnimating: boolean;
}

/**
 * Hook for animating number count-up effects
 * Uses GSAP for smooth interpolation with configurable easing
 */
export function useCountUp({
  start = 0,
  end,
  duration = 1.5,
  delay = 0,
  decimals = 0,
  suffix = '',
  prefix = '',
  easing = 'power2.out',
  onComplete,
}: UseCountUpOptions): UseCountUpReturn {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const objRef = useRef({ value: start });

  const formatValue = useCallback(
    (num: number): string => {
      const formatted = num.toFixed(decimals);
      return `${prefix}${formatted}${suffix}`;
    },
    [decimals, prefix, suffix]
  );

  const startAnimation = useCallback(() => {
    if (prefersReducedMotion) {
      setDisplayValue(end);
      onComplete?.();
      return;
    }

    tweenRef.current?.kill();
    setIsAnimating(true);
    objRef.current.value = start;

    tweenRef.current = gsap.to(objRef.current, {
      value: end,
      duration,
      delay,
      ease: easing,
      onUpdate: () => {
        setDisplayValue(objRef.current.value);
      },
      onComplete: () => {
        setIsAnimating(false);
        onComplete?.();
      },
    });
  }, [start, end, duration, delay, easing, prefersReducedMotion, onComplete]);

  const reset = useCallback(() => {
    tweenRef.current?.kill();
    setIsAnimating(false);
    objRef.current.value = start;
    setDisplayValue(start);
  }, [start]);

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  return {
    value: formatValue(displayValue),
    start: startAnimation,
    reset,
    isAnimating,
  };
}

/**
 * Simplified hook that auto-starts on mount
 */
export function useAutoCountUp(options: UseCountUpOptions): string {
  const { value, start } = useCountUp(options);

  useEffect(() => {
    start();
  }, [start]);

  return value;
}
