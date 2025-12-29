/**
 * Getting started guide for new users
 * Visual workflow overview with dismissible card
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Table2, Scale, GitBranch, Brain, X, Sparkles } from 'lucide-react';

const WORKFLOW_STEPS = [
  { icon: Upload, label: 'Upload Dataset', description: 'CSV or Excel file' },
  { icon: Table2, label: 'Review Schema', description: 'AI-detected types' },
  { icon: Scale, label: 'Add Rules', description: 'Business constraints' },
  { icon: GitBranch, label: 'Build Pipeline', description: 'ML workflow DAG' },
  { icon: Brain, label: 'Train & Evaluate', description: 'Model results' },
];

export function GettingStarted() {
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative bg-gradient-to-br from-[#131022] to-[#0a0a0f] border border-[#3713ec]/30 rounded-xl p-8 overflow-hidden"
        >
          {/* Animated background accents */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#3713ec] blur-[100px] opacity-10 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#22c55e] blur-[100px] opacity-10 animate-pulse delay-1000" />

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-4 right-4 p-2 text-[#9b92c9] hover:text-white hover:bg-[#1e1a36] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>

          <div className="relative">
            {/* Header */}
            <div className="flex items-start gap-3 mb-8">
              <div className="p-3 bg-[#3713ec]/10 rounded-lg">
                <Sparkles size={24} className="text-[#3713ec]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Getting Started with PipeWeave</h3>
                <p className="text-[#9b92c9]">
                  Follow these steps to build your first ML pipeline with AI assistance
                </p>
              </div>
            </div>

            {/* Workflow steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              {WORKFLOW_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    className="relative flex flex-col items-center text-center group"
                  >
                    {/* Connector line */}
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#3713ec]/50 to-transparent" />
                    )}

                    {/* Step number badge */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#3713ec] rounded-full flex items-center justify-center text-xs font-bold text-white z-10">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className="relative mb-3">
                      <div className="p-4 bg-[#1e1a36] border border-[#3713ec]/20 rounded-lg group-hover:border-[#3713ec] group-hover:bg-[#3713ec]/10 transition-all duration-300">
                        <Icon size={28} className="text-[#9b92c9] group-hover:text-[#3713ec] transition-colors" />
                      </div>
                    </div>

                    {/* Label */}
                    <div className="text-sm font-semibold text-white mb-1">{step.label}</div>
                    <div className="text-xs text-[#9b92c9]">{step.description}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-[#3713ec] hover:bg-[#4a2bef] text-white font-bold rounded-lg transition-all duration-200 flex items-center gap-3 shadow-lg shadow-[#3713ec]/20"
              >
                <Upload size={20} />
                Start Your First Project
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
