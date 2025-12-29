import { memo, useCallback } from 'react';
import { useDraggableNode } from '@/hooks/useDraggableNode';
import { PipelineNode } from './PipelineNode';
import type { PipelineNodeData, EncoderOption, NodePosition } from '@/types/pipeline-editor';

interface DraggableNodeWrapperProps {
  node: PipelineNodeData;
  scale: number;
  onPositionChange: (id: string, position: NodePosition) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onSwapEncoder?: (nodeId: string, option: EncoderOption) => void;
}

const DEFAULT_BOUNDS = {
  minX: -500,
  maxX: 4000,
  minY: -500,
  maxY: 3000,
};

/**
 * Wrapper connecting PipelineNode to useDraggableNode hook.
 * Position is managed by hook and applied via style transform.
 */
export const DraggableNodeWrapper = memo(function DraggableNodeWrapper({
  node,
  scale,
  onPositionChange,
  onDragStart,
  onDragEnd,
  onSwapEncoder,
}: DraggableNodeWrapperProps) {
  const handlePositionChange = useCallback(
    (pos: NodePosition) => {
      onPositionChange(node.id, pos);
    },
    [node.id, onPositionChange]
  );

  const handleDragEnd = useCallback(
    (_pos: NodePosition) => {
      onDragEnd();
    },
    [onDragEnd]
  );

  // Use node.position as the initial, but manage dragging internally
  const { nodeRef, position, isDragging, handlers } = useDraggableNode<HTMLDivElement>({
    initialPosition: node.position,
    onPositionChange: handlePositionChange,
    onDragStart,
    onDragEnd: handleDragEnd,
    bounds: DEFAULT_BOUNDS,
    scale,
  });

  return (
    <PipelineNode
      ref={nodeRef}
      node={node}
      isDragging={isDragging}
      onSwapEncoder={onSwapEncoder}
      handlers={handlers}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    />
  );
});
