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
      <T.List className={cn('scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-line', className)} {...props} />
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
        'relative -mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3.5 py-3 text-sm font-medium text-muted transition-colors hover:text-ink data-[state=active]:text-ink',
        !sliding && 'data-[state=active]:border-accent',
        className,
      )}
      {...props}
    >
      {children}
      {sliding && ctx.value === value && (
        <motion.span
          layoutId={`tab-indicator-${ctx.id}`}
          className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
    </T.Trigger>
  );
}
