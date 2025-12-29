import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Network, Menu, X, ExternalLink } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const navLinks = [
  { label: 'Schema Deduction', href: '/schema', isExternal: false },
  { label: 'Business Rules', href: '/business-rules', isExternal: false },
  { label: 'Pipeline Editor', href: '/pipeline-editor', isExternal: false },
  { label: 'Documentation', href: '#', isExternal: true },
];

const linkVariants: Variants = {
  initial: { scaleX: 0 },
  hover: { scaleX: 1 },
};

const mobileMenuVariants: Variants = {
  closed: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export function Navigation() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--slate-800)] bg-[var(--obsidian)]/90 backdrop-blur-md">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          initial={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="size-8 rounded bg-gradient-to-br from-[var(--primary)] to-indigo-900 flex items-center justify-center shadow-glow">
              <Network className="text-white w-5 h-5" />
            </div>
            <h1 className="text-white text-lg font-bold tracking-tight">
              MLE Workbench{' '}
              <span className="text-[var(--slate-500)] font-mono text-xs ml-1 font-normal hidden sm:inline">
                v2.0.4-beta
              </span>
            </h1>
          </Link>
        </motion.div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.label}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: prefersReducedMotion ? 0 : 0.1 + index * 0.05,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {link.isExternal ? (
                <motion.a
                  href={link.href}
                  className="relative flex items-center gap-1 text-[var(--slate-400)] hover:text-white text-sm font-medium transition-colors py-1"
                  whileHover="hover"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3" />
                  {!prefersReducedMotion && (
                    <motion.span
                      className="absolute bottom-0 left-0 right-0 h-px bg-[var(--primary)]"
                      variants={linkVariants}
                      initial="initial"
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      style={{ originX: 0 }}
                    />
                  )}
                </motion.a>
              ) : (
                <motion.div whileHover="hover" className="relative">
                  <Link
                    to={link.href}
                    className="text-[var(--slate-400)] hover:text-white text-sm font-medium transition-colors py-1 block"
                  >
                    {link.label}
                  </Link>
                  {!prefersReducedMotion && (
                    <motion.span
                      className="absolute bottom-0 left-0 right-0 h-px bg-[var(--primary)]"
                      variants={linkVariants}
                      initial="initial"
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      style={{ originX: 0 }}
                    />
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* System Status */}
          <motion.div
            className="flex items-center gap-3 border-l border-[var(--slate-800)] pl-6"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.4 }}
          >
            <div className="status-dot online animate-pulse" />
            <span className="text-xs font-mono text-[var(--slate-400)]">
              System Online
            </span>
          </motion.div>

          {/* Dashboard CTA */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : 0.5 }}
          >
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-[var(--primary)] hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors shadow-glow"
            >
              Dashboard
            </Link>
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden size-10 flex items-center justify-center text-[var(--slate-400)] hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-16 left-0 right-0 bg-[var(--obsidian)] border-b border-[var(--slate-800)] py-4"
            variants={prefersReducedMotion ? undefined : mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="max-w-[1280px] mx-auto px-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.isExternal ? (
                    <a
                      href={link.href}
                      className="flex items-center justify-between py-3 text-[var(--slate-300)] hover:text-white transition-colors border-b border-[var(--slate-800)] last:border-0"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="block py-3 text-[var(--slate-300)] hover:text-white transition-colors border-b border-[var(--slate-800)] last:border-0"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile Dashboard Button */}
              <Link
                to="/dashboard"
                className="mt-4 w-full py-3 bg-[var(--primary)] hover:bg-indigo-500 text-white text-center font-bold rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Go to Dashboard
              </Link>

              {/* Mobile Status */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[var(--slate-800)]">
                <div className="status-dot online animate-pulse" />
                <span className="text-xs font-mono text-[var(--slate-500)]">
                  System Online
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
