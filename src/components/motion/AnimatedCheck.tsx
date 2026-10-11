import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { useMotionOK } from './useMotionOK';

/** Success mark that draws itself once (static when motion is reduced). */
export function AnimatedCheck({ className, tone = 'success', icon }: { className?: string; tone?: 'success' | 'accent'; icon?: ReactNode }) {
  const ok = useMotionOK();
  const color = tone === 'success' ? 'text-yes' : 'text-accent';
  const ring = tone === 'success' ? 'bg-yes-soft' : 'bg-accent-soft';
  return (
    <span className={cn('relative inline-flex items-center justify-center rounded-full', ring, color, className)} aria-hidden>
      {ok && (
        <motion.span
          className={cn('absolute inset-0 rounded-full', ring)}
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      )}
      {icon ? (
        <motion.span initial={ok ? { scale: 0.4, rotate: -12, opacity: 0 } : false} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 16 }}>
          {icon}
        </motion.span>
      ) : (
        <svg viewBox="0 0 52 52" className="h-[62%] w-[62%]">
          <motion.circle
            cx="26"
            cy="26"
            r="23"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            initial={ok ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
          <motion.path
            d="M15 27 l7 7 l15 -16"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={ok ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.35, ease: 'easeOut' }}
          />
        </svg>
      )}
    </span>
  );
}
