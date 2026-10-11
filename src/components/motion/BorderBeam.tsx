import { cn } from '@/lib/cn';

/**
 * A slow light travelling around a rounded border (after Magic UI “BorderBeam”, MIT).
 * CSS-only (conic gradient + mask); paused for reduced motion via the global rule.
 */
export function BorderBeam({ className, duration = 9 }: { className?: string; duration?: number }) {
  return (
    <span
      aria-hidden
      className={cn('border-beam pointer-events-none absolute inset-0 rounded-[inherit]', className)}
      style={{ ['--beam-duration' as string]: `${duration}s` }}
    />
  );
}
