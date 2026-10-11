import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { useMotionOK } from './useMotionOK';

/** Probability bar that grows to its value on first view and eases on change. */
export function ProbabilityBar({ value, className, barClassName, color }: { value: number; className?: string; barClassName?: string; color?: string }) {
  const ok = useMotionOK();
  return (
    <div className={cn('h-1.5 overflow-hidden rounded-full bg-white/8', className)} aria-hidden>
      <motion.div
        className={cn('h-full rounded-full', barClassName)}
        style={{ background: color }}
        initial={ok ? { width: 0 } : false}
        animate={{ width: `${value}%` }}
        transition={{ duration: ok ? 0.9 : 0, ease: [0.22, 1, 0.36, 1], delay: ok ? 0.15 : 0 }}
      />
    </div>
  );
}
