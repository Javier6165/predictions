import { useLayoutEffect, useRef } from 'react';
import { animate } from 'motion/react';
import { useMotionOK } from './useMotionOK';

/**
 * Integer value that rolls from its previous value when it changes (inspired by
 * React Bits “CountUp”, rewritten for exact cents: the final text is always the
 * exact formatted value). `from` animates once on mount (e.g. hero figures);
 * `flash` briefly glows green/red in the direction of the change.
 */
export function AnimatedNumber({
  value,
  format,
  className,
  from,
  flash = false,
  duration = 0.7,
  ...rest
}: {
  value: number;
  format: (v: number) => string;
  className?: string;
  from?: number;
  flash?: boolean;
  duration?: number;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const ok = useMotionOK();
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(from ?? value);
  const mounted = useRef(false);

  // Text is owned by this effect (not React children) so animation frames never fight reconciliation.
  useLayoutEffect(() => {
    const el = ref.current;
    const start = prev.current;
    prev.current = value;
    const firstRun = !mounted.current;
    mounted.current = true;
    if (!el) return;
    if (!ok || start === value) {
      el.textContent = format(value);
      return;
    }
    if (flash && !firstRun) {
      el.classList.remove('value-flash-up', 'value-flash-down');
      void el.offsetWidth; // restart the CSS animation
      el.classList.add(value > start ? 'value-flash-up' : 'value-flash-down');
    }
    const controls = animate(start, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = format(Math.round(v));
      },
      onComplete: () => {
        el.textContent = format(value);
      },
    });
    return () => {
      controls.stop();
      el.textContent = format(value);
    };
  }, [value, ok, format, flash, duration]);

  return <span ref={ref} className={className} {...rest} />;
}
