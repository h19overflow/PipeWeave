import { useState, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCanvasTransform } from '@/hooks/useCanvasTransform';
import { DraggableNodeWrapper } from './DraggableNodeWrapper';
import { NodeConnectors } from './NodeConnectors';
import { FloatingToolbar } from './FloatingToolbar';
import type { PipelineNodeData, NodeConnection, EncoderOption, NodePosition } from '@/types/pipeline-editor';

interface PipelineCanvasProps {
  initialNodes: PipelineNodeData[];
  initialConnections: NodeConnection[];
  onNodeMove?: (nodeId: string, position: NodePosition) => void;
  onSwapEncoder?: (nodeId: string, option: EncoderOption) => void;
  onAddNode?: () => void;
  onUndo?: () => void;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 140;

export function PipelineCanvas({
  initialNodes,
  initialConnections,
  onNodeMove,
  onSwapEncoder,
  onAddNode,
  onUndo,
}: PipelineCanvasProps) {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLDivElement>(null);

  const { transform, handlers, fitToScreen, transformStyle } = useCanvasTransform({
    minScale: 0.25,
    maxScale: 2.5,
    scaleStep: 1.12,
  });

  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>(() =>
    initialNodes.reduce((acc, n) => ({ ...acc, [n.id]: n.position }), {})
  );
  const [nodes] = useState<PipelineNodeData[]>(initialNodes);
  const [connections] = useState<NodeConnection[]>(initialConnections);
  const [isDragging, setIsDragging] = useState(false);

  const handleNodePositionChange = useCallback(
    (nodeId: string, position: NodePosition) => {
      setNodePositions((prev) => ({ ...prev, [nodeId]: position }));
      onNodeMove?.(nodeId, position);
    },
    [onNodeMove]
  );

  const handleSwapEncoder = useCallback(
    (nodeId: string, option: EncoderOption) => {
      const el = document.querySelector(`[data-node-id="${nodeId}"]`);
      if (el && !prefersReducedMotion) {
        gsap.to(el, {
          scale: 0.95,
          duration: 0.15,
          ease: 'power2.in',
          onComplete: () => {
            gsap.to(el, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
          },
        });
      }
      onSwapEncoder?.(nodeId, option);
    },
    [onSwapEncoder, prefersReducedMotion]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (canvasRef.current) {
        handlers.handleWheel(e, canvasRef.current.getBoundingClientRect());
      }
    },
    [handlers]
  );

  const handleFitToScreen = useCallback(() => {
    if (!canvasRef.current) return;
    const nodeData = nodes.map((n) => ({
      id: n.id,
      position: nodePositions[n.id] || n.position,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    }));
    fitToScreen(nodeData, canvasRef.current.getBoundingClientRect());
  }, [nodes, nodePositions, fitToScreen]);

  // Memoized node data for connectors
  const nodeData = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        position: nodePositions[n.id] || n.position,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      })),
    [nodes, nodePositions]
  );

  // Grid background style
  const gridStyle = useMemo(() => ({
    backgroundImage: 'radial-gradient(#292348 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    backgroundPosition: `${transform.pan.x * 0.5}px ${transform.pan.y * 0.5}px`,
  }), [transform.pan]);

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative bg-[#0a0a0f] overflow-hidden"
      style={{ ...gridStyle, cursor: isDragging ? 'grabbing' : 'default' }}
      onWheel={handleWheel}
      onPointerDown={handlers.startPan}
      onPointerMove={handlers.updatePan}
      onPointerUp={handlers.endPan}
    >
      <FloatingToolbar onAddNode={onAddNode} onFitScreen={handleFitToScreen} onUndo={onUndo} />

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#131022]/80 border border-[#1e1a36] rounded-lg text-xs text-[#9b92c9] font-mono backdrop-blur-sm z-10">
        {Math.round(transform.scale * 100)}%
      </div>

      {/* Transformable canvas content */}
      <div className="absolute inset-0 origin-top-left" style={{ transform: transformStyle }}>
        <NodeConnectors connections={connections} nodes={nodeData} />
        <div className="absolute inset-0">
          {nodes.map((node) => (
            <DraggableNodeWrapper
              key={node.id}
              node={node}
              scale={transform.scale}
              onPositionChange={handleNodePositionChange}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onSwapEncoder={handleSwapEncoder}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
