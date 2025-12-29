import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ToolbarAction {
  icon: string;
  label: string;
  onClick: () => void;
}

interface FloatingToolbarProps {
  onAddNode?: () => void;
  onFitScreen?: () => void;
  onUndo?: () => void;
}

export function FloatingToolbar({ onAddNode, onFitScreen, onUndo }: FloatingToolbarProps) {
  const prefersReducedMotion = useReducedMotion();

  const actions: ToolbarAction[] = [
    { icon: 'add', label: 'Add Node', onClick: onAddNode || (() => {}) },
    { icon: 'fit_screen', label: 'Fit to Screen', onClick: onFitScreen || (() => {}) },
    { icon: 'undo', label: 'Undo', onClick: onUndo || (() => {}) },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : containerVariants}
      initial="hidden"
      animate="visible"
      className="absolute top-6 left-6 flex flex-col gap-2 z-10"
    >
      {actions.map((action) => (
        <motion.button
          key={action.icon}
          variants={prefersReducedMotion ? {} : itemVariants}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1, backgroundColor: 'rgba(41, 35, 72, 1)' }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          onClick={action.onClick}
          className="size-10 bg-pe-surface border border-pe-border rounded-lg flex items-center justify-center text-pe-text-secondary hover:text-white transition-colors shadow-lg"
          title={action.label}
        >
          <span className="material-symbols-outlined">{action.icon}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
