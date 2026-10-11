import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { useMotionOK } from './useMotionOK';

/**
 * Background “pill” that slides between the options of a segmented control.
 * Render it inside the active (relative) button, with the label in a `relative` span.
 * `layoutId` must be unique per control instance (use useId in the parent).
 */
export function ActivePill({ layoutId, className }: { layoutId: string; className?: string }) {
  const ok = useMotionOK();
  return (
    <motion.span
      aria-hidden
      layoutId={ok ? layoutId : undefined}
      className={cn('absolute inset-0 rounded-[inherit]', className)}
      transition={{ type: 'spring', stiffness: 520, damping: 40 }}
    />
  );
}
