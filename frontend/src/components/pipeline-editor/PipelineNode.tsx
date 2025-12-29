import { forwardRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SurgicalSwapDropdown } from './SurgicalSwapDropdown';
import type { PipelineNodeData, EncoderOption, NodeStatus } from '@/types/pipeline-editor';
import { PIPELINE_THEME } from '@/types/pipeline-editor';

interface PipelineNodeProps {
  node: PipelineNodeData;
  isDragging?: boolean;
  onSwapEncoder?: (nodeId: string, option: EncoderOption) => void;
  handlers?: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
  style?: React.CSSProperties;
}

const statusColors: Record<NodeStatus, string> = {
  success: PIPELINE_THEME.nodeStatusColors.success,
  warning: PIPELINE_THEME.nodeStatusColors.warning,
  pending: PIPELINE_THEME.nodeStatusColors.pending,
  error: PIPELINE_THEME.nodeStatusColors.error,
};

const encoderOptions: EncoderOption[] = [
  { id: 'label', name: 'Label Encoder' },
  { id: 'target', name: 'Target Encoder', isRecommended: true },
  { id: 'binary', name: 'Binary Encoder' },
];

// Memoized inner content to prevent re-renders during drag
const NodeContent = memo(function NodeContent({
  node,
  statusColor,
  isDropdownOpen,
  onDropdownToggle,
  onEncoderSelect,
  prefersReducedMotion,
}: {
  node: PipelineNodeData;
  statusColor: string;
  isDropdownOpen: boolean;
  onDropdownToggle: () => void;
  onEncoderSelect: (option: EncoderOption) => void;
  prefersReducedMotion: boolean;
}) {
  return (
    <>
      {/* Status Bar */}
      <motion.div
        className="h-1.5 w-full rounded-t-xl"
        style={{ backgroundColor: statusColor }}
        animate={
          node.isActive && !prefersReducedMotion
            ? { boxShadow: [`0 0 10px ${statusColor}40`, `0 0 20px ${statusColor}60`, `0 0 10px ${statusColor}40`] }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Input Port */}
      {node.type !== 'data-input' && (
        <motion.div
          className="absolute -left-1.5 top-1/2 -translate-y-1/2 size-3 bg-pe-surface rounded-full border-2 border-white/30"
          whileHover={prefersReducedMotion ? {} : { scale: 1.5, borderColor: '#3713ec' }}
        />
      )}

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]" style={{ color: node.iconColor }}>
              {node.icon}
            </span>
            <span className="font-bold text-sm text-white">{node.title}</span>
          </div>
          <motion.div
            className="size-2 rounded-full"
            style={{ backgroundColor: statusColor }}
            animate={
              node.status === 'warning' && !prefersReducedMotion
                ? { opacity: [1, 0.5, 1] }
                : {}
            }
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Encoder Dropdown */}
        {node.type === 'encoder' && node.isActive && (
          <SurgicalSwapDropdown
            currentOption="One-Hot"
            options={encoderOptions}
            onSelect={onEncoderSelect}
            isOpen={isDropdownOpen}
            onToggle={onDropdownToggle}
          />
        )}

        {/* Config Display */}
        {!node.isActive && (
          <div className="bg-[#141122] rounded p-2 border border-white/5">
            {Object.entries(node.config).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-[10px] text-pe-text-secondary">{key}</span>
                <span className="text-[10px] font-mono text-white">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Metadata Footer */}
        {node.metadata && (
          <div className="flex justify-between items-center mt-1">
            {Object.entries(node.metadata).map(([key, value]) => (
              <span key={key} className="text-[10px] text-pe-text-secondary">
                {value}
              </span>
            ))}
          </div>
        )}

        {/* Warning Message */}
        {node.status === 'warning' && (
          <span className="text-[10px] text-yellow-400">Context Align: Warning</span>
        )}

        {/* Pending Message */}
        {node.status === 'pending' && (
          <span className="text-[10px] text-pe-text-secondary">Pending input...</span>
        )}
      </div>

      {/* Output Port */}
      <motion.div
        className="absolute -right-1.5 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full border-2 border-pe-primary shadow-lg"
        whileHover={prefersReducedMotion ? {} : { scale: 1.5, boxShadow: '0 0 10px rgba(55,19,236,0.5)' }}
      />
    </>
  );
});

export const PipelineNode = memo(
  forwardRef<HTMLDivElement, PipelineNodeProps>(
    ({ node, isDragging, onSwapEncoder, handlers, style }, ref) => {
      const prefersReducedMotion = useReducedMotion();
      const [isDropdownOpen, setIsDropdownOpen] = useState(node.isActive || false);
      const statusColor = statusColors[node.status];

      const handleEncoderSelect = (option: EncoderOption) => {
        setIsDropdownOpen(false);
        onSwapEncoder?.(node.id, option);
      };

      const handleDropdownToggle = () => setIsDropdownOpen(!isDropdownOpen);

      return (
        <div
          ref={ref}
          data-node-id={node.id}
          className={cn(
            // Use absolute positioning at origin - transform handles actual position
            'absolute left-0 top-0 w-[200px] bg-pe-surface border rounded-xl shadow-xl',
            'flex flex-col group select-none touch-none',
            isDragging ? 'cursor-grabbing z-30' : 'cursor-grab z-10',
            node.isActive
              ? 'border-2 border-pe-primary shadow-[0_0_30px_rgba(55,19,236,0.15)] z-20'
              : 'border-pe-border hover:border-white/20'
          )}
          style={{
            ...style,
            transition: isDragging
              ? 'none'
              : 'box-shadow 0.2s ease, border-color 0.2s ease',
            opacity: node.status === 'pending' ? 0.8 : 1,
          }}
          {...handlers}
        >
          <NodeContent
            node={node}
            statusColor={statusColor}
            isDropdownOpen={isDropdownOpen}
            onDropdownToggle={handleDropdownToggle}
            onEncoderSelect={handleEncoderSelect}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      );
    }
  )
);

PipelineNode.displayName = 'PipelineNode';
