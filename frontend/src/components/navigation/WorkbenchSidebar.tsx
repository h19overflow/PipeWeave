/**
 * Unified sidebar navigation for PipeWeave ML Workbench
 * Supports collapsed/expanded states with workflow progress tracking
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { NavItem } from './NavItem';
import { WorkflowProgress } from './WorkflowProgress';
import { WORKFLOW_NAV_ITEMS, UTILITY_NAV_ITEMS, type WorkflowStep } from './navigation.config';

interface WorkbenchSidebarProps {
  currentStep: WorkflowStep;
  completedSteps?: WorkflowStep[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function WorkbenchSidebar({
  currentStep,
  completedSteps = [],
  isCollapsed = false,
  onToggleCollapse
}: WorkbenchSidebarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'relative flex flex-col bg-[#0a0a0f] border-r border-[#1e1a36]',
        'shadow-xl z-30'
      )}
    >
      {/* Logo/Brand */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-[#1e1a36]', isCollapsed && 'justify-center')}>
        <motion.div
          layout
          className="size-10 rounded-xl bg-gradient-to-br from-[#3713ec] to-[#4a2aff] flex items-center justify-center shadow-lg shadow-[#3713ec]/20"
        >
          <Layers className="size-6 text-white" />
        </motion.div>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-sm font-bold text-white">PipeWeave</span>
              <span className="text-xs text-[#9b92c9]">ML Workbench</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Workflow Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
        <div className="space-y-1">
          {WORKFLOW_NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={currentStep === item.id}
              isCompleted={completedSteps.includes(item.id)}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </nav>

      {/* Workflow Progress */}
      <WorkflowProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
        isCollapsed={isCollapsed}
      />

      {/* Utility Navigation */}
      <nav className="px-2 py-4 border-t border-[#1e1a36]">
        <div className="space-y-1">
          {UTILITY_NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={false}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className={cn('p-4 border-t border-[#1e1a36]', isCollapsed && 'px-2')}>
        <motion.button
          layout
          className={cn(
            'w-full flex items-center gap-3 p-2 rounded-xl transition-colors',
            'hover:bg-white/5',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">JD</span>
          </div>

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? {} : { opacity: 0 }}
                className="flex flex-col items-start flex-1 min-w-0"
              >
                <span className="text-sm font-medium text-white truncate w-full">John Doe</span>
                <span className="text-xs text-[#9b92c9] truncate w-full">john@example.com</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={cn(
            'absolute -right-3 top-20 size-6 rounded-full',
            'bg-[#131022] border border-[#1e1a36]',
            'flex items-center justify-center',
            'hover:bg-[#3713ec] hover:border-[#3713ec]',
            'transition-colors group'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4 text-[#9b92c9] group-hover:text-white" />
          ) : (
            <ChevronLeft className="size-4 text-[#9b92c9] group-hover:text-white" />
          )}
        </button>
      )}
    </motion.aside>
  );
}
