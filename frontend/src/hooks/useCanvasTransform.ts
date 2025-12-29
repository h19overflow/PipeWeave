import { useState, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from './useReducedMotion';
import type { NodePosition } from '@/types/pipeline-editor';

export interface CanvasTransform {
  scale: number;
  pan: { x: number; y: number };
}

interface UseCanvasTransformOptions {
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  initialTransform?: CanvasTransform;
}

interface NodeBounds {
  id: string;
  position: NodePosition;
  width: number;
  height: number;
}

const DEFAULT_TRANSFORM: CanvasTransform = { scale: 1, pan: { x: 0, y: 0 } };

/**
 * Canvas zoom/pan hook with correct zoom-to-cursor math.
 * Transform order: translate(x, y) scale(s) - translate FIRST, then scale.
 *
 * Zoom formula preserves world point under cursor:
 * 1. Calculate world point: worldP = (screenP - pan) / oldScale
 * 2. Apply new scale
 * 3. Recalculate pan: newPan = screenP - worldP * newScale
 */
export function useCanvasTransform(options: UseCanvasTransformOptions = {}) {
  const {
    minScale = 0.1,
    maxScale = 3,
    scaleStep = 1.15,
    initialTransform = DEFAULT_TRANSFORM,
  } = options;

  const prefersReducedMotion = useReducedMotion();
  const [transform, setTransform] = useState<CanvasTransform>(initialTransform);

  const isPanningRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<gsap.core.Tween | null>(null);

  /** Zoom toward cursor - CORRECT formula preserving world point */
  const handleWheel = useCallback(
    (e: React.WheelEvent, rect: DOMRect) => {
      e.preventDefault();

      // Cursor position relative to canvas container
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setTransform((prev) => {
        // Step 1: Calculate world point under cursor BEFORE scaling
        const worldX = (cursorX - prev.pan.x) / prev.scale;
        const worldY = (cursorY - prev.pan.y) / prev.scale;

        // Step 2: Calculate new scale with smooth clamping
        const direction = e.deltaY < 0 ? 1 : -1;
        const factor = direction > 0 ? scaleStep : 1 / scaleStep;
        const newScale = Math.min(maxScale, Math.max(minScale, prev.scale * factor));

        // Step 3: Recalculate pan to keep world point under cursor
        const newPanX = cursorX - worldX * newScale;
        const newPanY = cursorY - worldY * newScale;

        return { scale: newScale, pan: { x: newPanX, y: newPanY } };
      });
    },
    [minScale, maxScale, scaleStep]
  );

  /** Start pan on middle mouse or Alt+Left click */
  const startPan = useCallback((e: React.PointerEvent) => {
    const isMiddleButton = e.button === 1;
    const isAltLeftClick = e.button === 0 && e.altKey;

    if (isMiddleButton || isAltLeftClick) {
      e.preventDefault();
      e.stopPropagation();
      isPanningRef.current = true;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return true;
    }
    return false;
  }, []);

  /** Update pan position during drag */
  const updatePan = useCallback((e: React.PointerEvent) => {
    if (!isPanningRef.current) return false;

    const dx = e.clientX - lastPanRef.current.x;
    const dy = e.clientY - lastPanRef.current.y;
    lastPanRef.current = { x: e.clientX, y: e.clientY };

    setTransform((prev) => ({
      ...prev,
      pan: { x: prev.pan.x + dx, y: prev.pan.y + dy },
    }));
    return true;
  }, []);

  /** End pan and release pointer capture */
  const endPan = useCallback((e: React.PointerEvent) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      return true;
    }
    return false;
  }, []);

  /** Fit all nodes to screen with padding */
  const fitToScreen = useCallback(
    (nodes: NodeBounds[], containerRect: DOMRect, padding = 60) => {
      animationRef.current?.kill();

      if (nodes.length === 0) {
        const target = DEFAULT_TRANSFORM;
        if (prefersReducedMotion) {
          setTransform(target);
          return;
        }
        const proxy = { ...transform };
        animationRef.current = gsap.to(proxy, {
          scale: 1, 'pan.x': 0, 'pan.y': 0,
          duration: 0.4, ease: 'power2.out',
          onUpdate: () => setTransform({ scale: proxy.scale, pan: { ...proxy.pan } }),
        });
        return;
      }

      // Calculate bounding box of all nodes
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      nodes.forEach((n) => {
        minX = Math.min(minX, n.position.x);
        minY = Math.min(minY, n.position.y);
        maxX = Math.max(maxX, n.position.x + n.width);
        maxY = Math.max(maxY, n.position.y + n.height);
      });

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const availableWidth = containerRect.width - padding * 2;
      const availableHeight = containerRect.height - padding * 2;

      // Calculate scale to fit content
      const scaleX = availableWidth / contentWidth;
      const scaleY = availableHeight / contentHeight;
      const targetScale = Math.min(Math.max(minScale, Math.min(scaleX, scaleY)), maxScale);

      // Center the content
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const targetPanX = containerRect.width / 2 - centerX * targetScale;
      const targetPanY = containerRect.height / 2 - centerY * targetScale;

      if (prefersReducedMotion) {
        setTransform({ scale: targetScale, pan: { x: targetPanX, y: targetPanY } });
        return;
      }

      const proxy = { ...transform };
      animationRef.current = gsap.to(proxy, {
        scale: targetScale, 'pan.x': targetPanX, 'pan.y': targetPanY,
        duration: 0.5, ease: 'power3.out',
        onUpdate: () => setTransform({ scale: proxy.scale, pan: { ...proxy.pan } }),
      });
    },
    [transform, prefersReducedMotion, minScale, maxScale]
  );

  /** Convert screen coordinates to canvas world coordinates */
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number, rect: DOMRect): NodePosition => ({
      x: (screenX - rect.left - transform.pan.x) / transform.scale,
      y: (screenY - rect.top - transform.pan.y) / transform.scale,
    }),
    [transform]
  );

  /** Convert canvas world coordinates to screen coordinates */
  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number, rect: DOMRect): NodePosition => ({
      x: canvasX * transform.scale + transform.pan.x + rect.left,
      y: canvasY * transform.scale + transform.pan.y + rect.top,
    }),
    [transform]
  );

  /** Get CSS transform string - translate FIRST, then scale */
  const transformStyle = useMemo(
    () => `translate(${transform.pan.x}px, ${transform.pan.y}px) scale(${transform.scale})`,
    [transform]
  );

  return {
    transform,
    setTransform,
    isPanning: isPanningRef.current,
    handlers: { handleWheel, startPan, updatePan, endPan },
    fitToScreen,
    screenToCanvas,
    canvasToScreen,
    transformStyle,
  };
}
