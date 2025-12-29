import { useRef, useState, useCallback } from 'react';
import type { NodePosition } from '@/types/pipeline-editor';

interface DraggableNodeOptions {
  initialPosition: NodePosition;
  onPositionChange?: (position: NodePosition) => void;
  onDragStart?: () => void;
  onDragEnd?: (position: NodePosition) => void;
  bounds?: { minX: number; maxX: number; minY: number; maxY: number };
  scale?: number;
}

/**
 * Simple, reliable draggable hook.
 * Handles scale-aware dragging by dividing mouse delta by canvas scale.
 */
export function useDraggableNode<T extends HTMLElement>(options: DraggableNodeOptions) {
  const {
    initialPosition,
    onPositionChange,
    onDragStart,
    onDragEnd,
    bounds,
    scale = 1,
  } = options;

  const nodeRef = useRef<T>(null);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const [position, setPosition] = useState<NodePosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ clientX: number; clientY: number; nodeX: number; nodeY: number } | null>(null);

  /** Clamp position within bounds */
  const clamp = useCallback(
    (pos: NodePosition): NodePosition => {
      if (!bounds) return pos;
      return {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, pos.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, pos.y)),
      };
    },
    [bounds]
  );

  /** Handle pointer down - start drag */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return; // Only left click

      e.preventDefault();
      e.stopPropagation();

      const el = nodeRef.current;
      if (!el) return;

      el.setPointerCapture(e.pointerId);

      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        nodeX: position.x,
        nodeY: position.y,
      };

      setIsDragging(true);
      onDragStart?.();
    },
    [position, onDragStart]
  );

  /** Handle pointer move - update position with scale correction */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current) return;

      const s = scaleRef.current;

      // Divide delta by scale for correct movement at any zoom level
      const dx = (e.clientX - dragStartRef.current.clientX) / s;
      const dy = (e.clientY - dragStartRef.current.clientY) / s;

      const newPos = clamp({
        x: dragStartRef.current.nodeX + dx,
        y: dragStartRef.current.nodeY + dy,
      });

      setPosition(newPos);
      onPositionChange?.(newPos);
    },
    [clamp, onPositionChange]
  );

  /** Handle pointer up - end drag */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const el = nodeRef.current;
      if (el) {
        el.releasePointerCapture(e.pointerId);
      }

      if (dragStartRef.current) {
        const finalPos = position;
        dragStartRef.current = null;
        setIsDragging(false);
        onDragEnd?.(finalPos);
      }
    },
    [position, onDragEnd]
  );

  // Note: We intentionally do NOT sync position when initialPosition changes
  // The hook owns the position state - parent is notified via onPositionChange callback
  // This prevents snap-back issues when React re-renders with stale initial values

  return {
    nodeRef,
    position,
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
  };
}
