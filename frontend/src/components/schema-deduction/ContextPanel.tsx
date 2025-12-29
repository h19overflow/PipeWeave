/**
 * ContextPanel - Left sidebar with project info, metadata, and pipeline stages
 * Features staggered fade-in content animation
 */
import { motion, useReducedMotion } from 'framer-motion';
import { PipelineStages } from './PipelineStages';
import type { ProjectInfo, DatasetMetadata, PipelineStage } from '@/types/schema-deduction';
import { cn } from '@/lib/utils';

interface ContextPanelProps {
  project: ProjectInfo;
  metadata: DatasetMetadata;
  stages: PipelineStage[];
  className?: string;
}

const panelVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const, delay: 0.1 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 text-[#9b92c9]">
      {children}
    </h3>
  );
}

function MetadataItem({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[#9b92c9] text-xs">{label}</p>
      <div className="flex items-center gap-2">
        {icon && (
          <span className="material-symbols-outlined text-[#3713ec] text-[16px]">{icon}</span>
        )}
        <p className="text-white text-sm font-mono truncate" title={value}>{value}</p>
      </div>
    </div>
  );
}

export function ContextPanel({ project, metadata, stages, className }: ContextPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.aside
      className={cn(
        'w-72 flex flex-col border-r border-[#3b3267] bg-[#141122] overflow-y-auto shrink-0',
        className
      )}
      variants={panelVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="p-5 border-b border-[#3b3267]"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <h2 className="text-white text-lg font-bold leading-tight">{project.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <motion.span
            className="w-2 h-2 rounded-full bg-green-500"
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="text-[#9b92c9] text-xs font-mono">Environment: {project.environment}</p>
        </div>
      </motion.div>

      <motion.div
        className="p-5 border-b border-[#3b3267]"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <SectionTitle>Dataset Metadata</SectionTitle>
        <div className="grid grid-cols-1 gap-y-4">
          <MetadataItem label="Source File" value={metadata.sourceFile} icon="csv" />
          <div className="grid grid-cols-2 gap-4">
            <MetadataItem label="Rows" value={metadata.rowCount.toLocaleString()} />
            <MetadataItem label="Size" value={`${metadata.sizeInMb} MB`} />
          </div>
          <MetadataItem label="Last Updated" value={metadata.lastUpdated} />
        </div>
      </motion.div>

      <motion.div
        className="flex-1 p-5"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <SectionTitle>Pipeline Stages</SectionTitle>
        <PipelineStages stages={stages} />
      </motion.div>
    </motion.aside>
  );
}
