import { memo, useMemo } from 'react';

interface CanvasGridProps {
  pan: { x: number; y: number };
  scale: number;
  dotColor?: string;
  dotSize?: number;
  gridSpacing?: number;
}

/**
 * Dotted grid background that moves with pan (parallax effect).
 * Uses CSS background-image for GPU-accelerated rendering.
 * Grid spacing adjusts with zoom for consistent visual density.
 */
export const CanvasGrid = memo(function CanvasGrid({
  pan,
  scale,
  dotColor = '#292348',
  dotSize = 1,
  gridSpacing = 20,
}: CanvasGridProps) {
  const gridStyle = useMemo(() => {
    // Parallax factor - grid moves at half speed of content
    const parallaxFactor = 0.5;
    const adjustedSpacing = gridSpacing * scale;

    // Fade out grid dots when zoomed out too much
    const opacity = scale < 0.5 ? scale * 2 : 1;

    return {
      position: 'absolute' as const,
      inset: 0,
      pointerEvents: 'none' as const,
      backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
      backgroundSize: `${adjustedSpacing}px ${adjustedSpacing}px`,
      backgroundPosition: `${pan.x * parallaxFactor}px ${pan.y * parallaxFactor}px`,
      opacity,
      transition: 'opacity 0.2s ease',
    };
  }, [pan, scale, dotColor, dotSize, gridSpacing]);

  return <div style={gridStyle} aria-hidden="true" />;
});
