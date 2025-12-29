/**
 * Individual navigation item component with active, completed, and default states
 * Supports workflow step badges and tooltips in collapsed state
 */

import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { NavItem as NavItemType } from './navigation.config';

interface NavItemProps {
  item: NavItemType;
  isActive: boolean;
  isCompleted?: boolean;
  isCollapsed?: boolean;
}

export function NavItem({ item, isActive, isCompleted, isCollapsed }: NavItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const IconComponent = LucideIcons[item.icon as keyof typeof LucideIcons] as React.FC<{ className?: string }>;

  return (
    <NavLink
      to={item.path}
      className={({ isActive: linkActive }) =>
        cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
          'hover:bg-white/5',
          linkActive || isActive
            ? 'text-[#3713ec] bg-[#3713ec]/10'
            : 'text-[#9b92c9] hover:text-white'
        )
      }
    >
      {({ isActive: linkActive }) => (
        <>
          {/* Active Indicator */}
          {(linkActive || isActive) && (
            <motion.div
              layoutId="navActiveIndicator"
              className="absolute inset-y-0 left-0 w-1 bg-[#3713ec] rounded-r-full"
              initial={prefersReducedMotion ? {} : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}

          {/* Icon Container */}
          <div className="relative flex items-center justify-center size-6 shrink-0">
            <IconComponent className="size-5" />

            {/* Step Badge */}
            {item.step && !isCollapsed && (
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'absolute -top-1 -right-1 size-4 rounded-full text-[10px] font-bold',
                  'flex items-center justify-center border',
                  isCompleted
                    ? 'bg-[#22c55e] border-[#22c55e]/20 text-white'
                    : 'bg-[#131022] border-[#1e1a36] text-[#9b92c9]'
                )}
              >
                {isCompleted ? '✓' : item.step}
              </motion.div>
            )}
          </div>

          {/* Label */}
          {!isCollapsed && (
            <motion.span
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
              className="text-sm font-medium truncate"
            >
              {item.label}
            </motion.span>
          )}

          {/* Tooltip for Collapsed State */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-[#131022] border border-[#1e1a36]
              text-sm font-medium text-white whitespace-nowrap opacity-0 invisible
              group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
              {item.label}
              {item.step && (
                <span className="ml-2 text-xs text-[#9b92c9]">
                  Step {item.step}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}
