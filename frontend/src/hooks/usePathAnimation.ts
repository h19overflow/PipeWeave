import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from './useReducedMotion';
import type { NodePosition } from '@/types/pipeline-editor';

interface PathPoint {
  x: number;
  y: number;
}

interface UsePathAnimationOptions {
  isActive?: boolean;
  dashLength?: number;
  animationDuration?: number;
}

/**
 * Generates a smooth bezier curve path between two points.
 * Creates visually pleasing S-curves with adaptive curvature.
 */
export function generateBezierPath(
  start: PathPoint,
  end: PathPoint,
  curvature: number = 0.4
): string {
  const dx = end.x - start.x;
  const horizontalOffset = Math.max(Math.abs(dx) * curvature, 50);

  const cp1x = start.x + horizontalOffset;
  const cp1y = start.y;
  const cp2x = end.x - horizontalOffset;
  const cp2y = end.y;

  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
}

/**
 * Hook for animating SVG connector paths with flowing dash effect.
 */
export function usePathAnimation(options: UsePathAnimationOptions = {}) {
  const { isActive = false, animationDuration = 40 } = options;
  const pathRef = useRef<SVGPathElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || prefersReducedMotion) return;

    if (animationRef.current) {
      animationRef.current.kill();
    }

    if (!isActive) {
      // Flowing dash animation for inactive connections
      animationRef.current = gsap.to(path, {
        strokeDashoffset: -1000,
        duration: animationDuration,
        ease: 'none',
        repeat: -1,
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [isActive, animationDuration, prefersReducedMotion]);

  return { pathRef };
}

/**
 * Hook for path draw-in animation on mount.
 */
export function usePathDrawAnimation() {
  const pathRef = useRef<SVGPathElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const animateDraw = useCallback((duration: number = 0.6) => {
    const path = pathRef.current;
    if (!path || prefersReducedMotion) return;

    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      duration,
      ease: 'power2.out',
    });
  }, [prefersReducedMotion]);

  const animateRemove = useCallback((duration: number = 0.3) => {
    const path = pathRef.current;
    if (!path || prefersReducedMotion) return;

    const length = path.getTotalLength();

    return gsap.to(path, {
      strokeDashoffset: -length,
      duration,
      ease: 'power2.in',
    });
  }, [prefersReducedMotion]);

  return { pathRef, animateDraw, animateRemove };
}

/**
 * Calculate connector port positions for nodes.
 */
export function calculateConnectorPoints(
  sourceNode: { position: NodePosition; width: number; height: number },
  targetNode: { position: NodePosition; width: number; height: number }
): { start: PathPoint; end: PathPoint } {
  // Output port on right side of source node (with small offset)
  const start: PathPoint = {
    x: sourceNode.position.x + sourceNode.width + 6,
    y: sourceNode.position.y + sourceNode.height / 2,
  };

  // Input port on left side of target node
  const end: PathPoint = {
    x: targetNode.position.x - 6,
    y: targetNode.position.y + targetNode.height / 2,
  };

  return { start, end };
}

/**
 * Hook for smooth path transitions when nodes move.
 * Uses immediate updates during drag, smooth transitions otherwise.
 */
export function usePathTransition(isDragging: boolean = false) {
  const pathRef = useRef<SVGPathElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const transitionToPath = useCallback((newPath: string, duration: number = 0.25) => {
    const path = pathRef.current;
    if (!path) return;

    // Immediate update during drag for 60fps
    if (isDragging || prefersReducedMotion) {
      path.setAttribute('d', newPath);
      return;
    }

    // Smooth transition when not dragging
    gsap.to(path, {
      attr: { d: newPath },
      duration,
      ease: 'power2.out',
      overwrite: true,
    });
  }, [isDragging, prefersReducedMotion]);

  return { pathRef, transitionToPath };
}
