/**
 * Quick statistics cards with animated count-up numbers
 * Technical brutalist aesthetic with monospace data display
 */

import { motion } from 'framer-motion';
import { Database, GitBranch, Brain, TrendingUp } from 'lucide-react';
import { useAutoCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  delay: number;
  accentColor: string;
}

function StatCard({ icon, label, value, suffix = '', delay, accentColor }: StatCardProps) {
  const countUpValue = useAutoCountUp({
    end: value,
    duration: 2,
    delay,
    decimals: suffix === '%' ? 0 : 0,
    suffix,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      className="group relative bg-[#131022] border border-[#1e1a36] rounded-lg p-6 overflow-hidden hover:border-[#3713ec]/50 transition-all duration-300"
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 h-0.5 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: accentColor }}
      />

      {/* Icon background glow */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: accentColor }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="text-[#9b92c9] text-sm font-medium uppercase tracking-wider mb-3">
            {label}
          </div>
          <div
            className="text-5xl font-bold tracking-tight mb-1"
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              color: accentColor,
              textShadow: `0 0 20px ${accentColor}40`,
            }}
          >
            {countUpValue}
          </div>
        </div>

        <div
          className="p-3 rounded-lg transition-all duration-300 group-hover:scale-110 flex items-center justify-center"
          style={{ background: `${accentColor}15` }}
        >
          <div className="flex items-center justify-center" style={{ color: accentColor }}>{icon}</div>
        </div>
      </div>

      {/* Hexagonal corner accent */}
      <svg
        className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity"
        width="80"
        height="80"
        viewBox="0 0 80 80"
      >
        <path
          d="M40 0 L80 20 L80 60 L40 80 L0 60 L0 20 Z"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
        />
      </svg>
    </motion.div>
  );
}

interface QuickStatsProps {
  datasets: number;
  pipelines: number;
  models: number;
  successRate: number;
}

export function QuickStats({ datasets, pipelines, models, successRate }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<Database size={24} strokeWidth={2} />}
        label="Total Datasets"
        value={datasets}
        delay={0.1}
        accentColor="#3713ec"
      />
      <StatCard
        icon={<GitBranch size={24} strokeWidth={2} />}
        label="Active Pipelines"
        value={pipelines}
        delay={0.2}
        accentColor="#8b5cf6"
      />
      <StatCard
        icon={<Brain size={24} strokeWidth={2} />}
        label="Trained Models"
        value={models}
        delay={0.3}
        accentColor="#a855f7"
      />
      <StatCard
        icon={<TrendingUp size={24} strokeWidth={2} />}
        label="Success Rate"
        value={successRate}
        suffix="%"
        delay={0.4}
        accentColor="#c084fc"
      />
    </div>
  );
}
