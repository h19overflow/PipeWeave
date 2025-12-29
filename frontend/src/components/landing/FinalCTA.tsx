import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function FinalCTA() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section ref={sectionRef} className="w-full max-w-[1200px] px-6 py-20 md:py-28 mx-auto">
      <div className="relative rounded-3xl border border-[var(--slate-800)] bg-gradient-to-br from-[var(--slate-900)] to-[var(--obsidian)] p-10 md:p-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--primary)] opacity-[0.07] blur-[120px] pointer-events-none" />

        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center">
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to stop the assumption tax?
          </motion.h2>

          <motion.p
            className="text-[var(--slate-400)] text-lg md:text-xl max-w-xl mx-auto mb-10"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Start building context-first ML pipelines in 10 minutes.
            Validate before you vectorize.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Primary CTA */}
            <Link to="/schema">
              <motion.button
                className="group flex items-center gap-3 bg-[var(--primary)] hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-glow"
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>

            {/* Secondary CTA */}
            <motion.button
              className="group flex items-center gap-3 bg-transparent border border-[var(--slate-700)] hover:border-[var(--slate-600)] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-[var(--slate-900)]"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Talk to Sales</span>
            </motion.button>
          </motion.div>

          {/* Trust note */}
          <motion.p
            className="mt-8 text-sm text-[var(--slate-500)]"
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            No credit card required. Free tier available.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
