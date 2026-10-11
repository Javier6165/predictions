import { useLayoutEffect, useRef } from 'react';
import { animate } from 'motion/react';
import { useMotionOK } from './useMotionOK';

/**
 * Integer-cent value that rolls from its previous value when it changes (never
 * from zero on mount). Inspired by React Bits “CountUp”, rewritten for exact cents:
 * the final text is always the exact formatted value.
 */
export function AnimatedNumber({ value, format, className, ...rest }: { value: number; format: (v: number) => string; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const ok = useMotionOK();
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  // Text is owned by this effect (not React children) so animation frames never fight reconciliation.
  useLayoutEffect(() => {
    const el = ref.current;
    const from = prev.current;
    prev.current = value;
    if (!el) return;
    if (!ok || from === value) {
      el.textContent = format(value);
      return;
    }
    const controls = animate(from, value, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = format(Math.round(v));
      },
      onComplete: () => {
        el.textContent = format(value);
      },
    });
    return () => controls.stop();
  }, [value, ok, format]);

  return (
    <span ref={ref} className={className} {...rest} />
  );
}
