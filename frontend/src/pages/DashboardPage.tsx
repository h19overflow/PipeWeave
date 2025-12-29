/**
 * Dashboard Page - Main workbench entry point
 * Shows quick stats, recent projects, and getting started guide
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';
import { QuickStats, RecentProjects, GettingStarted, NewProjectModal } from '@/components/dashboard';
import type { ProjectCardProps } from '@/components/dashboard';
import type { WorkflowStep } from '@/components/navigation/navigation.config';

// Mock data
const MOCK_STATS = {
  datasets: 12,
  pipelines: 8,
  models: 5,
  successRate: 94,
};

const MOCK_PROJECTS: ProjectCardProps[] = [
  {
    id: '1',
    name: 'Customer Churn Analysis',
    dataset: 'customers.csv',
    currentStage: 'pipeline' as WorkflowStep,
    progress: 80,
    lastModified: new Date('2025-12-28'),
  },
  {
    id: '2',
    name: 'Sales Forecasting',
    dataset: 'sales_2024.csv',
    currentStage: 'schema' as WorkflowStep,
    progress: 33,
    lastModified: new Date('2025-12-27'),
  },
  {
    id: '3',
    name: 'Fraud Detection',
    dataset: 'transactions.csv',
    currentStage: 'business-rules' as WorkflowStep,
    progress: 50,
    lastModified: new Date('2025-12-26'),
  },
];

export function DashboardPage() {
  const [projects] = useState<ProjectCardProps[]>(MOCK_PROJECTS);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const hasProjects = projects.length > 0;

  const userName = 'Alex'; // In production, fetch from auth context

  return (
    <div className="min-h-full bg-[#0a0a0f] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3713ec] to-[#7c3aed]">
                  {userName}
                </span>
              </h1>
              <p className="text-[#9b92c9] text-lg">Build ML pipelines with AI-powered guidance</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-6 py-3 bg-[#3713ec] hover:bg-[#4a2bef] text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg shadow-[#3713ec]/20"
            >
              <Plus size={20} strokeWidth={2.5} />
              New Project
            </motion.button>
          </div>

          {/* Command hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#131022] border border-[#1e1a36] rounded-lg text-sm text-[#9b92c9]"
          >
            <Zap size={14} className="text-[#3713ec]" />
            <span>Tip: Press</span>
            <kbd className="px-2 py-0.5 bg-[#1e1a36] border border-[#3713ec]/30 rounded text-xs font-mono text-white">
              Ctrl+K
            </kbd>
            <span>for quick actions</span>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <div className="mb-12">
          <QuickStats {...MOCK_STATS} />
        </div>

        {/* Getting Started Guide - Only show when no projects */}
        {!hasProjects && (
          <div className="mb-12">
            <GettingStarted />
          </div>
        )}

        {/* Recent Projects */}
        <div>
          <RecentProjects projects={projects} onViewAll={() => console.log('View all projects')} />
        </div>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
}
