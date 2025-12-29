import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gavel } from 'lucide-react';
import { gsap } from 'gsap';
import { LawItem, LawItemData } from './LawItem';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

const initialLaws: LawItemData[] = [
  {
    id: '1',
    title: 'Ignore 2020 outliers (COVID impact)',
    code: 'WHERE year != 2020',
    filterPercent: '12.4%',
    type: 'filter',
    tag: 'manual',
    enabled: true,
  },
  {
    id: '2',
    title: 'Enforce non-null user_ids',
    code: 'user_id IS NOT NULL',
    filterPercent: '0.3%',
    type: 'enforce',
    tag: 'system',
    enabled: true,
  },
  {
    id: '3',
    title: 'Cap transaction amount at 1M',
    code: 'amount <= 1000000',
    type: 'block',
    tag: 'manual',
    enabled: false,
  },
];

interface ActiveLawsListProps {
  laws?: LawItemData[];
  onLawsChange?: (laws: LawItemData[]) => void;
  className?: string;
}

export function ActiveLawsList({
  laws: externalLaws,
  onLawsChange,
  className,
}: ActiveLawsListProps) {
  const prefersReducedMotion = useReducedMotion();
  const [internalLaws, setInternalLaws] = useState(initialLaws);
  const headerRef = useRef<HTMLDivElement>(null);

  const laws = externalLaws ?? internalLaws;

  useEffect(() => {
    if (prefersReducedMotion || !headerRef.current) return;

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.45, ease: 'power2.out' }
    );
  }, [prefersReducedMotion]);

  const stats = useMemo(() => {
    const active = laws.filter((l) => l.enabled).length;
    const disabled = laws.length - active;
    return { active, disabled };
  }, [laws]);

  const handleToggle = (id: string) => {
    const updatedLaws = laws.map((law) =>
      law.id === id ? { ...law, enabled: !law.enabled } : law
    );

    if (onLawsChange) {
      onLawsChange(updatedLaws);
    } else {
      setInternalLaws(updatedLaws);
    }
  };

  const handleEdit = (id: string) => {
    console.log('Edit law:', id);
  };

  return (
    <section className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div
        ref={headerRef}
        className="flex items-center justify-between"
      >
        <h3 className="text-white font-medium text-lg flex items-center gap-2">
          <Gavel className="size-5 text-text-muted" />
          Active Laws
        </h3>
        <div className="flex gap-2 text-sm">
          <motion.span
            key={stats.active}
            initial={prefersReducedMotion ? {} : { scale: 1.2, color: '#3713ec' }}
            animate={{ scale: 1, color: '#9b92c9' }}
            className="text-text-muted"
          >
            {stats.active} active
          </motion.span>
          <span className="text-border-dark">|</span>
          <motion.span
            key={stats.disabled}
            initial={prefersReducedMotion ? {} : { scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-text-muted"
          >
            {stats.disabled} disabled
          </motion.span>
        </div>
      </div>

      {/* Laws List */}
      <div className="flex flex-col gap-3">
        {laws.map((law, index) => (
          <LawItem
            key={law.id}
            law={law}
            index={index}
            onToggle={handleToggle}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </section>
  );
}
