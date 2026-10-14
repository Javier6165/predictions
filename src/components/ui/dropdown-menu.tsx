import * as React from 'react';
import { DropdownMenu as M } from 'radix-ui';
import { cn } from '@/lib/cn';

export const DropdownMenu = M.Root;
export const DropdownMenuTrigger = M.Trigger;
export const DropdownMenuGroup = M.Group;
export const DropdownMenuLabel = M.Label;

export function DropdownMenuContent({ className, sideOffset = 10, align = 'end', ...props }: React.ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content
        sideOffset={sideOffset}
        align={align}
        collisionPadding={12}
        className={cn(
          'z-50 min-w-60 rounded-2xl border border-line-strong bg-bg-elev/95 p-1.5 text-ink backdrop-blur-xl data-[state=open]:animate-pop-in',
          className,
        )}
        style={{ boxShadow: 'var(--shadow-pop)' }}
        {...props}
      />
    </M.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof M.Item>) {
  return (
    <M.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-2 outline-none transition data-[highlighted]:bg-ink/6 data-[highlighted]:text-ink [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-muted',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof M.Separator>) {
  return <M.Separator className={cn('my-1.5 h-px bg-line', className)} {...props} />;
}
