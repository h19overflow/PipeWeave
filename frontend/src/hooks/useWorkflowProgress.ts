/**
 * Custom hook for managing workflow progress across the ML workbench
 * Tracks current step, completed steps, and provides navigation helpers
 */

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { WORKFLOW_NAV_ITEMS, type WorkflowStep } from '@/components/navigation/navigation.config';

const STORAGE_KEY = 'pipeweave_workflow_progress';

export interface UseWorkflowProgressReturn {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  markStepComplete: (step: WorkflowStep) => void;
  isStepCompleted: (step: WorkflowStep) => boolean;
  getNextStep: () => WorkflowStep | null;
  resetProgress: () => void;
  progress: number; // 0-100 percentage
}

export function useWorkflowProgress(): UseWorkflowProgressReturn {
  const location = useLocation();

  // Load completed steps from localStorage
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist completed steps to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
  }, [completedSteps]);

  // Determine current step from pathname
  const currentStep = useMemo(() => {
    const path = location.pathname;
    const navItem = WORKFLOW_NAV_ITEMS.find(item => path.startsWith(item.path));
    return navItem?.id || 'dashboard';
  }, [location.pathname]);

  // Calculate progress percentage
  const progress = useMemo(() => {
    const totalSteps = WORKFLOW_NAV_ITEMS.filter(item => item.step).length;
    return Math.round((completedSteps.length / totalSteps) * 100);
  }, [completedSteps.length]);

  const markStepComplete = (step: WorkflowStep) => {
    setCompletedSteps(prev =>
      prev.includes(step) ? prev : [...prev, step]
    );
  };

  const isStepCompleted = (step: WorkflowStep): boolean => {
    return completedSteps.includes(step);
  };

  const getNextStep = (): WorkflowStep | null => {
    const currentIndex = WORKFLOW_NAV_ITEMS.findIndex(item => item.id === currentStep);
    if (currentIndex === -1 || currentIndex >= WORKFLOW_NAV_ITEMS.length - 1) {
      return null;
    }
    const nextItem = WORKFLOW_NAV_ITEMS[currentIndex + 1];
    return nextItem?.id || null;
  };

  const resetProgress = () => {
    setCompletedSteps([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    currentStep,
    completedSteps,
    markStepComplete,
    isStepCompleted,
    getNextStep,
    resetProgress,
    progress
  };
}
