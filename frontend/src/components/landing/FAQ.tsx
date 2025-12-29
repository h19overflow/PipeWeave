import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const faqs = [
  {
    question: 'What data formats do you support?',
    answer: 'We support CSV files up to 10GB with automatic chunking. Excel files (.xlsx) and Parquet formats are on our roadmap. All uploads are validated and analyzed instantly.',
  },
  {
    question: 'How does schema deduction work?',
    answer: 'Our AI analyzes each column in your dataset and suggests the most appropriate data type. It catches "integer traps" (like Zip codes and IDs stored as integers) and provides confidence scores for each suggestion. You can accept, modify, or reject any suggestion.',
  },
  {
    question: 'Can I define custom business rules?',
    answer: 'Absolutely. You can inject any constraint - exclude specific dates, set value bounds, require non-null values, define cross-column relationships, and more. These rules are immutable and enforced throughout the entire pipeline.',
  },
  {
    question: 'What ML algorithms are supported?',
    answer: 'We support Random Forest, XGBoost, LightGBM, and Scikit-learn algorithms out of the box. You can also bring your own custom models. Hyperparameter tuning is built-in.',
  },
  {
    question: 'How does surgical swapping work?',
    answer: 'When you change a component in your pipeline (like swapping StandardScaler for MinMaxScaler), only the downstream path from that component is recalculated. Unaffected branches remain cached, saving significant compute time.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Your data never leaves your infrastructure. We offer self-hosted deployment options, and all data processing happens within your environment. SOC 2 compliance is in progress.',
  },
];

export function FAQ() {
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useScrollReveal<HTMLDivElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-[800px] px-6 py-20 md:py-28 mx-auto">
      {/* Section Header */}
      <div ref={headerRef} className="text-center mb-12">
        <p className="text-sm font-medium text-[var(--primary)] uppercase tracking-wider mb-4">
          FAQ
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Frequently asked questions
        </h2>
        <p className="text-[var(--slate-400)] text-lg">
          Everything you need to know about MLE Workbench.
        </p>
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="border border-[var(--slate-800)] rounded-xl overflow-hidden bg-[var(--slate-900)]/40"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--slate-900)]/60 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="text-white font-medium pr-4">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown className="w-5 h-5 text-[var(--slate-400)]" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0 text-[var(--slate-400)] leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
