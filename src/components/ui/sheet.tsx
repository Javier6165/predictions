import * as React from 'react';
import { Dialog as D } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export const Sheet = D.Root;
export const SheetTrigger = D.Trigger;
export const SheetClose = D.Close;
export const SheetTitle = D.Title;
export const SheetDescription = D.Description;

/** Bottom sheet on mobile; right drawer when `side="right"`. */
export function SheetContent({
  className,
  children,
  side = 'bottom',
  ...props
}: React.ComponentProps<typeof D.Content> & { side?: 'bottom' | 'right' | 'left' }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[3px] data-[state=open]:animate-fade-in" />
      <D.Content
        className={cn(
          'fixed z-50 flex flex-col overflow-y-auto bg-surface text-ink outline-none',
          side === 'bottom' &&
            'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl border-t border-line-strong data-[state=open]:animate-slide-up',
          side === 'right' &&
            'inset-y-0 right-0 w-[min(92vw,380px)] border-l border-line-strong data-[state=open]:animate-slide-left',
          side === 'left' && 'inset-y-0 left-0 w-[min(92vw,360px)] border-r border-line-strong',
          className,
        )}
        style={{ boxShadow: 'var(--shadow-pop)' }}
        {...props}
      >
        {side === 'bottom' && <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/15" />}
        {children}
        <D.Close
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition hover:bg-ink/5 hover:text-ink"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}
