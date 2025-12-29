/**
 * ModelCard - Individual model display card
 * Shows model metadata, status, metrics, and action buttons
 */

import { motion } from 'framer-motion';
import { Download, Eye, Loader2, CheckCircle2, XCircle, Database, Calendar, Cpu } from 'lucide-react';
import { ModelMetrics } from './ModelMetrics';
import type { MLModel } from '@/types/models';

interface ModelCardProps extends MLModel {
  onDownload?: (id: string) => void;
  onView?: (id: string) => void;
}

const STATUS_CONFIG = {
  training: {
    icon: Loader2,
    label: 'Training',
    className: 'text-[#f59e0b] animate-spin',
    bgClassName: 'bg-[#f59e0b]/10 border-[#f59e0b]/30',
  },
  ready: {
    icon: CheckCircle2,
    label: 'Ready',
    className: 'text-[#22c55e]',
    bgClassName: 'bg-[#22c55e]/10 border-[#22c55e]/30',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    className: 'text-[#ef4444]',
    bgClassName: 'bg-[#ef4444]/10 border-[#ef4444]/30',
  },
};

const TYPE_CONFIG = {
  classification: {
    label: 'Classification',
    className: 'bg-[#3713ec]/20 border-[#3713ec]/30 text-[#3713ec]',
  },
  regression: {
    label: 'Regression',
    className: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  },
};

export function ModelCard({
  id,
  name,
  type,
  algorithm,
  metrics,
  trainedAt,
  datasetName,
  status,
  onDownload,
  onView,
}: ModelCardProps) {
  const statusConfig = STATUS_CONFIG[status];
  const typeConfig = TYPE_CONFIG[type];
  const StatusIcon = statusConfig.icon;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(trainedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-[#131022] border border-[#1e1a36] rounded-xl p-5 hover:border-[#3713ec]/50 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate mb-2">{name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${typeConfig.className}`}>
              {typeConfig.label}
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-xs font-medium flex items-center gap-1 ${statusConfig.bgClassName}`}>
              <StatusIcon className={`w-3 h-3 ${statusConfig.className}`} />
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Algorithm & Dataset Info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-[#1e1a36]">
        <div className="flex items-center gap-2 text-sm">
          <Cpu className="w-4 h-4 text-[#9b92c9]" />
          <span className="text-[#9b92c9]">Algorithm:</span>
          <span className="text-white font-medium">{algorithm}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Database className="w-4 h-4 text-[#9b92c9]" />
          <span className="text-[#9b92c9]">Dataset:</span>
          <span className="text-white truncate">{datasetName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-[#9b92c9]" />
          <span className="text-[#9b92c9]">Trained:</span>
          <span className="text-white">{formattedDate}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-4">
        <ModelMetrics type={type} metrics={metrics} compact />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          onClick={() => onView?.(id)}
          disabled={status === 'training'}
          whileHover={status !== 'training' ? { scale: 1.02 } : {}}
          whileTap={status !== 'training' ? { scale: 0.98 } : {}}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#3713ec] hover:bg-[#3713ec]/90 disabled:bg-[#1e1a36] disabled:text-[#9b92c9] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Details
        </motion.button>
        <motion.button
          onClick={() => onDownload?.(id)}
          disabled={status !== 'ready'}
          whileHover={status === 'ready' ? { scale: 1.02 } : {}}
          whileTap={status === 'ready' ? { scale: 0.98 } : {}}
          className="flex items-center justify-center gap-2 px-3 py-2 border border-[#3b3267] hover:border-[#3713ec]/50 hover:bg-[#1e1a36] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
