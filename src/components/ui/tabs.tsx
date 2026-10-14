import * as React from 'react';
import { Tabs as T } from 'radix-ui';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { useMotionOK } from '@/components/motion/useMotionOK';

export const Tabs = T.Root;
export function TabsContent({ className, ...props }: React.ComponentProps<typeof T.Content>) {
  return <T.Content className={cn('data-[state=active]:animate-fade-in', className)} {...props} />;
}

const IndicatorCtx = React.createContext<{ value?: string; id: string }>({ id: '' });

/** Pass `activeValue` to get a sliding underline between triggers. */
export function TabsList({ className, activeValue, ...props }: React.ComponentProps<typeof T.List> & { activeValue?: string }) {
  const id = React.useId();
  return (
    <IndicatorCtx.Provider value={{ value: activeValue, id }}>
      <T.List className={cn('scrollbar-none inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-ink/[0.06] p-1', className)} {...props} />
    </IndicatorCtx.Provider>
  );
}

export function TabsTrigger({ className, value, children, ...props }: React.ComponentProps<typeof T.Trigger>) {
  const ctx = React.useContext(IndicatorCtx);
  const ok = useMotionOK();
  const sliding = ok && ctx.value !== undefined;
  return (
    <T.Trigger
      value={value}
      className={cn(
        'relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] font-medium text-ink-2 transition-colors hover:text-ink data-[state=active]:text-ink',
        !sliding && 'data-[state=active]:bg-surface data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    >
      {sliding && ctx.value === value && (
        <motion.span
          layoutId={`tab-indicator-${ctx.id}`}
          className="absolute inset-0 rounded-full bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </T.Trigger>
  );
}
