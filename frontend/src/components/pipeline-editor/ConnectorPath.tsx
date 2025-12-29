import { useMemo, memo } from 'react';

interface ConnectorPathProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  isActive?: boolean;
}

/**
 * Generate smooth cubic bezier path with adaptive curvature.
 */
export function generateBezierPath(
  start: { x: number; y: number },
  end: { x: number; y: number }
): string {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Adaptive control point offset based on distance
  const baseOffset = Math.abs(dx) * 0.4;
  const minOffset = 50;
  const maxOffset = 200;
  const offset = Math.max(minOffset, Math.min(maxOffset, baseOffset));

  // Adjust for vertical offset to create smoother S-curves
  const verticalBias = Math.abs(dy) * 0.1;

  return `M ${start.x} ${start.y} C ${start.x + offset} ${start.y + verticalBias}, ${end.x - offset} ${end.y - verticalBias}, ${end.x} ${end.y}`;
}

/**
 * Simple, reliable connector path component.
 * No complex animations - just renders the path immediately.
 */
export const ConnectorPath = memo(function ConnectorPath({
  start,
  end,
  isActive = false,
}: ConnectorPathProps) {
  const path = useMemo(() => generateBezierPath(start, end), [start, end]);

  const strokeColor = isActive ? 'url(#active-gradient)' : '#5b4d8c';
  const strokeWidth = isActive ? 3 : 2;

  return (
    <path
      d={path}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={isActive ? 'none' : '8,6'}
      strokeLinecap="round"
      style={{
        filter: isActive ? 'drop-shadow(0 0 8px rgba(55, 19, 236, 0.5))' : 'none',
      }}
    />
  );
});
