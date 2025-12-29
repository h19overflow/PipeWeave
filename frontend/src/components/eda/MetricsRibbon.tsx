/**
 * MetricsRibbon - Animated KPI stat cards for EDA summary
 * Displays key dataset metrics with count-up animations and quality indicators
 */

import { motion } from 'framer-motion';
import { FileText, AlertCircle, Copy, Hash, Tag, HardDrive } from 'lucide-react';
import { useAutoCountUp } from '@/hooks/useCountUp';
import type { EDASummary } from '@/types/eda';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  delay: number;
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
}

const STATUS_COLORS = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  neutral: '#3713ec',
};

function MetricCard({ icon, label, value, suffix = '', delay, status }: MetricCardProps) {
  const accentColor = STATUS_COLORS[status];
  const countUpValue = useAutoCountUp({ end: value, duration: 1.8, delay, decimals: suffix === '%' ? 1 : 0, suffix });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      className="group relative bg-[#131022] border border-[#1e1a36] rounded-lg p-4 overflow-hidden hover:border-[#3713ec]/50 transition-colors duration-300"
    >
      <div className="absolute top-0 left-0 h-0.5 w-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: accentColor }} />

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg transition-transform group-hover:scale-105" style={{ background: `${accentColor}15` }}>
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[#9b92c9] text-xs font-medium uppercase tracking-wider truncate">{label}</div>
          <div
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: accentColor, textShadow: `0 0 16px ${accentColor}30` }}
          >
            {countUpValue}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface MetricsRibbonProps {
  summary: EDASummary;
}

export function MetricsRibbon({ summary }: MetricsRibbonProps) {
  const nullStatus = summary.nullPercentage > 20 ? 'critical' : summary.nullPercentage > 5 ? 'warning' : 'healthy';
  const dupeStatus = summary.duplicatePercentage > 10 ? 'critical' : summary.duplicatePercentage > 2 ? 'warning' : 'healthy';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard icon={<FileText size={18} />} label="Total Rows" value={summary.rowCount} delay={0.05} status="neutral" />
      <MetricCard icon={<AlertCircle size={18} />} label="Null %" value={summary.nullPercentage} suffix="%" delay={0.1} status={nullStatus} />
      <MetricCard icon={<Copy size={18} />} label="Duplicate %" value={summary.duplicatePercentage} suffix="%" delay={0.15} status={dupeStatus} />
      <MetricCard icon={<Hash size={18} />} label="Numeric Cols" value={summary.numericColumns} delay={0.2} status="neutral" />
      <MetricCard icon={<Tag size={18} />} label="Categorical" value={summary.categoricalColumns} delay={0.25} status="neutral" />
      <MetricCard icon={<HardDrive size={18} />} label="Size (MB)" value={summary.memorySizeMB} delay={0.3} status="neutral" />
    </div>
  );
}
