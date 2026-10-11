import * as React from 'react';
import { cn } from '@/lib/cn';

export function Chip({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-ink-2',
        className,
      )}
      {...props}
    />
  );
}

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn('rounded-md border border-line-strong bg-white/5 px-1.5 py-0.5 font-sans text-[11px] text-muted', className)}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
  className,
  as: As = 'h2',
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  as?: 'h2' | 'h3';
}) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <As className="text-xl font-semibold tracking-tight text-ink sm:text-[22px]">{title}</As>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
