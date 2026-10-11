import { useRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/**
 * Cursor-following soft light on hover (after React Bits “SpotlightCard”).
 * Pure CSS variables, no re-renders; mouse only, and hidden with reduced motion.
 */
export function Spotlight({
  className,
  children,
  color = 'rgba(122,162,255,0.14)',
  as: Tag = 'div',
  ...rest
}: HTMLAttributes<HTMLElement> & { color?: string; as?: 'div' | 'article' }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <Tag
      ref={ref as never}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        if (e.pointerType !== 'mouse' || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ref.current.style.setProperty('--sx', `${e.clientX - r.left}px`);
        ref.current.style.setProperty('--sy', `${e.clientY - r.top}px`);
      }}
      className={cn('spotlight relative', className)}
      style={{ ['--spot' as string]: color }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
