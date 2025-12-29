/**
 * ModelsList - Grid layout for displaying model cards
 * Handles loading states, empty states, and responsive grid
 */

import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { ModelCard } from './ModelCard';
import type { MLModel } from '@/types/models';

interface ModelsListProps {
  models: MLModel[];
  isLoading?: boolean;
  onDownload?: (id: string) => void;
  onView?: (id: string) => void;
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-[#131022] border border-[#1e1a36] rounded-xl p-5 h-[320px]"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-[#1e1a36] rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-6 bg-[#1e1a36] rounded w-24" />
              <div className="h-6 bg-[#1e1a36] rounded w-20" />
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-[#1e1a36] rounded" />
              <div className="h-4 bg-[#1e1a36] rounded" />
              <div className="h-4 bg-[#1e1a36] rounded" />
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-[#1e1a36] rounded" />
              <div className="h-3 bg-[#1e1a36] rounded" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative mb-6">
        <Brain className="w-24 h-24 text-[#3713ec]/30" />
        <Sparkles className="w-8 h-8 text-[#3713ec] absolute -top-2 -right-2 animate-pulse" />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-2">No Models Yet</h3>
      <p className="text-[#9b92c9] text-center max-w-md mb-6">
        You haven't trained any models yet. Complete the pipeline construction and training
        steps to see your models here.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-[#3713ec] hover:bg-[#3713ec]/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Start Training
      </motion.button>
    </motion.div>
  );
}

export function ModelsList({ models, isLoading = false, onDownload, onView }: ModelsListProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (models.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map((model, index) => (
        <motion.div
          key={model.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ModelCard {...model} onDownload={onDownload} onView={onView} />
        </motion.div>
      ))}
    </div>
  );
}
