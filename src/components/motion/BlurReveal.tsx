import { motion } from 'motion/react';
import { useMotionOK } from './useMotionOK';
import { cn } from '@/lib/cn';

/**
 * Word-by-word blur-in for editorial headings (after React Bits “BlurText”).
 * Screen readers get the plain sentence once; the animated words are hidden from them.
 */
export function BlurReveal({ text, className, wordClassName, delay = 0 }: { text: string; className?: string; wordClassName?: string; delay?: number }) {
  const ok = useMotionOK();
  if (!ok) return <span className={cn(className, wordClassName)}>{text}</span>;
  const words = text.split(' ');
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            className={cn('inline-block will-change-[filter,transform,opacity]', wordClassName)}
            initial={{ opacity: 0, filter: 'blur(10px)', y: 14 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.55, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
