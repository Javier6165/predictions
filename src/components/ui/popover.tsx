import * as React from 'react';
import { Popover as P } from 'radix-ui';
import { cn } from '@/lib/cn';

export const Popover = P.Root;
export const PopoverTrigger = P.Trigger;
export const PopoverAnchor = P.Anchor;
export const PopoverClose = P.Close;

export function PopoverContent({ className, align = 'end', sideOffset = 10, ...props }: React.ComponentProps<typeof P.Content>) {
  return (
    <P.Portal>
      <P.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          'z-50 rounded-2xl border border-line-strong bg-bg-elev/95 text-ink outline-none backdrop-blur-xl data-[state=open]:animate-pop-in',
          className,
        )}
        style={{ boxShadow: 'var(--shadow-pop)' }}
        {...props}
      />
    </P.Portal>
  );
}
