import * as React from 'react';
import { Dialog as D } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({
  className,
  children,
  hideClose,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof D.Content> & { hideClose?: boolean }) {
  // Controlled dialogs have no Radix Trigger, so remember who opened them and return focus there.
  const returnTo = React.useRef<HTMLElement | null>(null);
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-[#0f0e0c]/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
      <D.Content
        className={cn(
          'fixed z-50 flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-y-auto bg-bg-elev text-ink outline-none data-[state=open]:animate-pop-in',
          'bottom-0 left-0 rounded-t-3xl border-t border-line-strong',
          'sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border',
          className,
        )}
        style={{ boxShadow: 'var(--shadow-pop)' }}
        onOpenAutoFocus={(e) => {
          const active = document.activeElement as HTMLElement | null;
          returnTo.current = active && active !== document.body ? active : null;
          onOpenAutoFocus?.(e);
        }}
        onCloseAutoFocus={(e) => {
          onCloseAutoFocus?.(e);
          const el = returnTo.current;
          if (!e.defaultPrevented && el?.isConnected) {
            e.preventDefault();
            el.focus();
          }
        }}
        {...props}
      >
        {children}
        {!hideClose && (
          <D.Close
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </D.Close>
        )}
      </D.Content>
    </D.Portal>
  );
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof D.Title>) {
  return <D.Title className={cn('text-lg font-semibold tracking-tight', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof D.Description>) {
  return <D.Description className={cn('text-sm text-muted', className)} {...props} />;
}
