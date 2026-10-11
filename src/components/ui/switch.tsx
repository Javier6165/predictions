import * as React from 'react';
import { Switch as S } from 'radix-ui';
import { cn } from '@/lib/cn';

export function Switch({ className, ...props }: React.ComponentProps<typeof S.Root>) {
  return (
    <S.Root
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-line-strong bg-surface-3 transition data-[state=checked]:bg-accent',
        className,
      )}
      {...props}
    >
      <S.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
    </S.Root>
  );
}
