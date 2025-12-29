/**
 * Header component for workbench pages
 * Displays breadcrumb, page title, actions, and optional next step navigation
 */

import { ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface WorkbenchHeaderProps {
  title?: string;
  actions?: React.ReactNode;
  showNextStep?: boolean;
  nextStepPath?: string;
  nextStepLabel?: string;
}

export function WorkbenchHeader({
  title = 'Workbench',
  actions,
  showNextStep = false,
  nextStepPath,
  nextStepLabel = 'Next Step'
}: WorkbenchHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#1e1a36]">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Breadcrumb + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <nav className="flex items-center gap-2 text-sm text-[#9b92c9]">
              <Link
                to="/dashboard"
                className="hover:text-white transition-colors"
              >
                PipeWeave
              </Link>
              <ChevronRight className="size-4 shrink-0" />
              <span className="text-white font-medium truncate">{title}</span>
            </nav>
          </div>

          {/* Right: Actions + Next Step */}
          <div className="flex items-center gap-3">
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}

            {showNextStep && nextStepPath && (
              <Link
                to={nextStepPath}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl',
                  'bg-gradient-to-r from-[#3713ec] to-[#4a2aff]',
                  'text-white text-sm font-medium',
                  'hover:shadow-lg hover:shadow-[#3713ec]/30',
                  'transition-all duration-200',
                  'group'
                )}
              >
                {nextStepLabel}
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
