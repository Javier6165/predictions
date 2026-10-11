import * as React from 'react';
import { Tabs as T } from 'radix-ui';
import { cn } from '@/lib/cn';

export const Tabs = T.Root;
export const TabsContent = T.Content;

export function TabsList({ className, ...props }: React.ComponentProps<typeof T.List>) {
  return (
    <T.List
      className={cn('scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-line', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof T.Trigger>) {
  return (
    <T.Trigger
      className={cn(
        'relative -mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3.5 py-3 text-sm font-medium text-muted transition hover:text-ink data-[state=active]:border-accent data-[state=active]:text-ink',
        className,
      )}
      {...props}
    />
  );
}
