import { useMemo, memo } from 'react';
import { ConnectorPath } from './ConnectorPath';
import type { NodeConnection, NodePosition } from '@/types/pipeline-editor';

interface NodeData {
  id: string;
  position: NodePosition;
  width: number;
  height: number;
}

interface NodeConnectorsProps {
  connections: NodeConnection[];
  nodes: NodeData[];
}

const PORT_OFFSET = 6;

/**
 * SVG layer for node connection lines.
 * Calculates port positions based on node dimensions.
 */
export const NodeConnectors = memo(function NodeConnectors({
  connections,
  nodes,
}: NodeConnectorsProps) {
  // Build lookup map for O(1) node access
  const nodeMap = useMemo(
    () => nodes.reduce((acc, n) => ({ ...acc, [n.id]: n }), {} as Record<string, NodeData>),
    [nodes]
  );

  // Calculate connector endpoints from node positions
  const connectorData = useMemo(() => {
    return connections
      .map((conn) => {
        const src = nodeMap[conn.sourceNodeId];
        const tgt = nodeMap[conn.targetNodeId];
        if (!src || !tgt) return null;

        // Output port: right side of source node
        const startX = src.position.x + src.width + PORT_OFFSET;
        const startY = src.position.y + src.height / 2;

        // Input port: left side of target node
        const endX = tgt.position.x - PORT_OFFSET;
        const endY = tgt.position.y + tgt.height / 2;

        return {
          id: conn.id,
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
          isActive: conn.isActive,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      start: { x: number; y: number };
      end: { x: number; y: number };
      isActive: boolean;
    }>;
  }, [connections, nodeMap]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <defs>
        <linearGradient id="active-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3713ec" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#6d52f4" stopOpacity="1" />
          <stop offset="100%" stopColor="#3713ec" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {connectorData.map((c) => (
        <ConnectorPath
          key={c.id}
          start={c.start}
          end={c.end}
          isActive={c.isActive}
        />
      ))}
    </svg>
  );
});
