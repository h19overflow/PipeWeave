/**
 * Main layout wrapper for PipeWeave ML Workbench
 * Provides unified sidebar navigation and page structure
 */

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { WorkbenchSidebar } from '@/components/navigation';
import { WorkbenchHeader } from './WorkbenchHeader';
import { useWorkflowProgress } from '@/hooks/useWorkflowProgress';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { WORKFLOW_NAV_ITEMS } from '@/components/navigation/navigation.config';

const SIDEBAR_COLLAPSED_KEY = 'pipeweave_sidebar_collapsed';

export function WorkbenchLayout() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const {
    currentStep,
    completedSteps,
    getNextStep
  } = useWorkflowProgress();

  // Persist sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Get current page metadata
  const currentNavItem = WORKFLOW_NAV_ITEMS.find(item => item.id === currentStep);
  const nextStep = getNextStep();
  const nextNavItem = nextStep ? WORKFLOW_NAV_ITEMS.find(item => item.id === nextStep) : null;

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Sidebar */}
      <WorkbenchSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <WorkbenchHeader
          title={currentNavItem?.label}
          showNextStep={!!nextNavItem}
          nextStepPath={nextNavItem?.path}
          nextStepLabel={`Next: ${nextNavItem?.label}`}
        />

        {/* Page Content with Transitions */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
