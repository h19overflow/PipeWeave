/**
 * New Project Modal
 * Animated form for creating new ML projects
 * - Staggered field animations on entry
 * - Form validation with error states
 * - Tag input with multi-select functionality
 */

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Check, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

export interface NewProjectFormData {
  name: string;
  description: string;
  projectType: ProjectType;
  tags: string[];
}

export type ProjectType =
  | 'classification'
  | 'regression'
  | 'clustering'
  | 'time-series';

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'classification', label: 'Classification' },
  { value: 'regression', label: 'Regression' },
  { value: 'clustering', label: 'Clustering' },
  { value: 'time-series', label: 'Time Series Forecasting' },
];

const SUGGESTED_TAGS = [
  'Customer Analytics',
  'Sales Prediction',
  'Fraud Detection',
  'Churn Analysis',
  'Demand Forecasting',
  'Sentiment Analysis',
];

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Stagger delay for each form field
const FIELD_DELAYS = [0, 0.08, 0.16, 0.24, 0.32];

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NewProjectFormData>({
    name: '',
    description: '',
    projectType: 'classification',
    tags: [],
  });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Project name is required' });
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log('New Project Created:', formData);

    setIsSubmitting(false);
    setShowSuccess(true);

    // Navigate after success animation
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      navigate('/dataset');
    }, 1200);
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      projectType: 'classification',
      tags: [],
    });
    setErrors({});
    setShowSuccess(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <SuccessState key="success" />
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Project Name */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: FIELD_DELAYS[0], duration: 0.35, ease: 'easeOut' }}
            >
              <FormField
                label="Project Name"
                required
                error={errors.name}
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Customer Churn Prediction"
                  className={cn(
                    'form-input',
                    errors.name && 'border-red-500/50 focus:ring-red-500/30'
                  )}
                />
              </FormField>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: FIELD_DELAYS[1], duration: 0.35, ease: 'easeOut' }}
            >
              <FormField label="Description" optional>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Briefly describe your ML project goals..."
                  rows={3}
                  className="form-input resize-none"
                />
              </FormField>
            </motion.div>

            {/* Project Type */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: FIELD_DELAYS[2], duration: 0.35, ease: 'easeOut' }}
            >
              <FormField label="Project Type" required>
                <div className="grid grid-cols-2 gap-2">
                  {PROJECT_TYPES.map((type) => (
                    <TypeOption
                      key={type.value}
                      label={type.label}
                      selected={formData.projectType === type.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          projectType: type.value,
                        }))
                      }
                    />
                  ))}
                </div>
              </FormField>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: FIELD_DELAYS[3], duration: 0.35, ease: 'easeOut' }}
            >
              <FormField label="Tags" optional>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      selected={formData.tags.includes(tag)}
                      onClick={() => toggleTag(tag)}
                    />
                  ))}
                </div>
              </FormField>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: FIELD_DELAYS[4], duration: 0.35, ease: 'easeOut' }}
              className="pt-2"
            >
              <SubmitButton isSubmitting={isSubmitting} />
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>

      <style>{formStyles}</style>
    </Modal>
  );
}

// Sub-components
function FormField({
  label,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-white">
        {label}
        {required && <span className="text-[#3713ec]">*</span>}
        {optional && (
          <span className="text-xs text-[#9b92c9] font-normal">(optional)</span>
        )}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function TypeOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-[#3713ec]/40',
        selected
          ? 'bg-[#3713ec] border-[#3713ec] text-white shadow-lg shadow-[#3713ec]/20'
          : 'bg-[#0a0a0f] border-[#1e1a36] text-[#9b92c9] hover:border-[#3713ec]/50 hover:text-white'
      )}
    >
      {label}
    </motion.button>
  );
}

function TagChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
        'border transition-all duration-200',
        selected
          ? 'bg-[#3713ec]/20 border-[#3713ec] text-[#3713ec]'
          : 'bg-[#0a0a0f] border-[#1e1a36] text-[#9b92c9] hover:border-[#3713ec]/40'
      )}
    >
      {selected && <Check size={12} />}
      {label}
      {selected && (
        <X
          size={12}
          className="ml-0.5 hover:text-white transition-colors"
        />
      )}
    </motion.button>
  );
}

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={isSubmitting}
      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
      className={cn(
        'w-full py-3 rounded-lg font-semibold text-white',
        'bg-gradient-to-r from-[#3713ec] to-[#5b30f0]',
        'hover:from-[#4520f5] hover:to-[#6b40ff]',
        'focus:outline-none focus:ring-2 focus:ring-[#3713ec]/50 focus:ring-offset-2 focus:ring-offset-[#131022]',
        'transition-all duration-200',
        'shadow-lg shadow-[#3713ec]/25',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2'
      )}
    >
      {isSubmitting ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Sparkles size={18} />
          Create Project
        </>
      )}
    </motion.button>
  );
}

function SuccessState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="py-8 flex flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-[#3713ec]/20 flex items-center justify-center mb-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 400, delay: 0.2 }}
        >
          <Check size={32} className="text-[#3713ec]" />
        </motion.div>
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-xl font-semibold text-white mb-2"
      >
        Project Created!
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-[#9b92c9] text-sm"
      >
        Redirecting to dataset upload...
      </motion.p>
    </motion.div>
  );
}

const formStyles = `
  .form-input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    background: #0a0a0f;
    border: 1px solid #1e1a36;
    border-radius: 0.5rem;
    color: white;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  .form-input::placeholder {
    color: #6b6494;
  }
  .form-input:focus {
    outline: none;
    border-color: #3713ec;
    box-shadow: 0 0 0 3px rgba(55, 19, 236, 0.15);
  }
  .form-input:hover:not(:focus) {
    border-color: #3713ec50;
  }
`;
