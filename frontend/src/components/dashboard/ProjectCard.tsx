/**
 * Individual project card with stage indicator and progress
 * Hexagonal progress ring with glitch-style hover effect
 */

import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import type { WorkflowStep } from '@/components/navigation/navigation.config';
import { WORKFLOW_NAV_ITEMS } from '@/components/navigation/navigation.config';

export interface ProjectCardProps {
  id: string;
  name: string;
  dataset: string;
  currentStage: WorkflowStep;
  lastModified: Date;
  progress: number;
  onClick?: () => void;
}

export function ProjectCard({
  name,
  dataset,
  currentStage,
  lastModified,
  progress,
  onClick,
}: ProjectCardProps) {
  const stageInfo = WORKFLOW_NAV_ITEMS.find((item) => item.id === currentStage);
  const stepNumber = stageInfo?.step || 1;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Calculate hexagonal path length for progress animation
  // const circumference = 2 * Math.PI * 45;
  // const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="group relative w-full bg-[#131022] border border-[#1e1a36] rounded-lg p-6 text-left overflow-hidden hover:border-[#3713ec] transition-all duration-300"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3713ec]/0 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

      {/* Glitch effect accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#3713ec] blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 group-hover:animate-pulse" />

      <div className="relative flex items-start gap-4">
        {/* Hexagonal progress indicator */}
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Background hexagon */}
            <path
              d="M50 5 L86.6 27.5 L86.6 72.5 L50 95 L13.4 72.5 L13.4 27.5 Z"
              fill="none"
              stroke="#1e1a36"
              strokeWidth="2"
            />
            {/* Progress hexagon */}
            <path
              d="M50 5 L86.6 27.5 L86.6 72.5 L50 95 L13.4 72.5 L13.4 27.5 Z"
              fill="none"
              stroke="#3713ec"
              strokeWidth="3"
              strokeDasharray={`${(progress / 100) * 300} 300`}
              className="transition-all duration-700 ease-out group-hover:stroke-[#22c55e]"
              style={{ filter: 'drop-shadow(0 0 8px #3713ec80)' }}
            />
          </svg>

          {/* Step number overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {stepNumber}
              </div>
              <div className="text-xs text-[#9b92c9] uppercase tracking-wider">Step</div>
            </div>
          </div>
        </div>

        {/* Project info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-[#3713ec] transition-colors">
            {name}
          </h3>
          <p className="text-sm text-[#9b92c9] mb-3 flex items-center gap-2">
            <span className="truncate">{dataset}</span>
          </p>

          {/* Stage badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3713ec]/10 border border-[#3713ec]/30 rounded text-xs font-medium text-[#3713ec] uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3713ec] animate-pulse" />
            {stageInfo?.label}
          </div>

          {/* Last modified */}
          <div className="flex items-center gap-2 mt-4 text-xs text-[#9b92c9]">
            <Clock size={12} />
            <span>{formatDate(lastModified)}</span>
          </div>
        </div>

        {/* Continue arrow - appears on hover */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <div className="p-2 bg-[#3713ec] rounded-lg">
            <ArrowRight size={20} className="text-white" />
          </div>
        </motion.div>
      </div>

      {/* Progress bar at bottom */}
      <div className="relative mt-4 h-1 bg-[#1e1a36] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-[#3713ec] to-[#22c55e] rounded-full"
          style={{ boxShadow: '0 0 10px #3713ec80' }}
        />
      </div>
    </motion.button>
  );
}
