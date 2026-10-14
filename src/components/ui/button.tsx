import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background,color,border,box-shadow,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-cta text-on-cta hover:bg-cta-hover',
        white: 'bg-cta text-on-cta hover:bg-cta-hover',
        secondary: 'bg-ink/[0.06] text-ink hover:bg-ink/10',
        ghost: 'text-ink-2 hover:bg-ink/6 hover:text-ink',
        outline: 'border border-line-strong text-ink hover:border-ink/40 hover:bg-ink/[0.03]',
        yes: 'bg-yes text-on-side hover:bg-yes-strong',
        no: 'bg-no text-on-side hover:bg-no-strong',
        danger: 'bg-danger text-on-side hover:bg-danger-hover',
        link: 'h-auto px-0 text-accent hover:underline underline-offset-4',
      },
      size: {
        sm: 'h-8 px-3 text-[13px]',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-[15px]',
        xl: 'h-14 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...(asChild ? {} : { type: type ?? 'button' })}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
