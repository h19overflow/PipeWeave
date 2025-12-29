import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Terminal,
  FileText,
  Github,
  Twitter,
  Network,
  ArrowRight,
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Schema Deduction', href: '/schema' },
      { label: 'Business Rules', href: '/business-rules' },
      { label: 'Pipeline Editor', href: '/pipeline-editor' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Tutorials', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: FileText, href: '#', label: 'Docs' },
];

const iconVariants: Variants = {
  rest: { scale: 1, color: 'var(--slate-500)' },
  hover: { scale: 1.15, color: '#ffffff' },
};

const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 30px rgba(90, 92, 242, 0.4)',
  },
  tap: { scale: 0.98 },
};

export function Footer() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="border-t border-[var(--slate-800)] bg-[var(--obsidian)]">
      {/* CTA Section */}
      <div className="max-w-[1280px] mx-auto px-6 py-20">
        <motion.div
          className="relative rounded-2xl border border-[var(--slate-800)] bg-gradient-to-br from-[var(--slate-900)] to-[var(--obsidian)] p-8 md:p-12 overflow-hidden"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 bg-grid pointer-events-none" />

          {/* Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--primary)] opacity-10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Ready to stop the assumption tax?
              </motion.h3>

              <motion.p
                className="text-[var(--slate-400)] text-lg max-w-xl"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Start building context-first ML pipelines in 10 minutes.
                Validate before you vectorize.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/schema">
                <motion.button
                  className="group flex items-center gap-3 bg-[var(--primary)] hover:bg-indigo-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-glow"
                  variants={prefersReducedMotion ? undefined : buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Terminal className="w-5 h-5" />
                  <span>Initialize Context</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>

              <a href="#" target="_blank" rel="noopener noreferrer">
                <motion.button
                  className="flex items-center gap-3 bg-transparent border border-[var(--slate-700)] hover:border-[var(--slate-600)] text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                  variants={prefersReducedMotion ? undefined : buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FileText className="w-5 h-5" />
                  <span>View Docs</span>
                </motion.button>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Links Section */}
      <div className="border-t border-[var(--slate-800)]">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded bg-gradient-to-br from-[var(--primary)] to-indigo-900 flex items-center justify-center">
                  <Network className="text-white w-5 h-5" />
                </div>
                <span className="text-white font-bold">MLE Workbench</span>
              </div>
              <p className="text-[var(--slate-500)] text-sm mb-4">
                Context-First ML Engineering Platform.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    className="text-[var(--slate-500)] hover:text-white transition-colors"
                    variants={prefersReducedMotion ? {} : iconVariants}
                    initial="rest"
                    whileHover="hover"
                    aria-label={link.label}
                  >
                    <link.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-white font-bold text-sm mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('/') ? (
                        <Link
                          to={link.href}
                          className="text-[var(--slate-500)] hover:text-white text-sm transition-colors"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-[var(--slate-500)] hover:text-white text-sm transition-colors"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--slate-800)]">
        <div className="max-w-[1280px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[var(--slate-500)] text-sm font-mono">
            {new Date().getFullYear()} MLE Workbench. All systems operational.
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-[var(--slate-500)] hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-[var(--slate-500)] hover:text-white transition-colors"
            >
              Terms
            </a>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-[var(--slate-500)]">Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
