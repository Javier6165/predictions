import { Info, PlusCircle, RotateCcw, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/state/store';
import { useUi } from '@/state/ui';
import { availableCents } from '@/domain/selectors';
import { formatMoney } from '@/lib/format';

export function Avatar({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex ${className} items-center justify-center overflow-hidden rounded-full bg-[conic-gradient(from_200deg,#7aa2ff,#b388ff,#5ee0c1,#7aa2ff)] p-[2px]`}
    >
      <span className="flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-[12px] font-bold text-ink">DE</span>
    </span>
  );
}

export function AccountMenu() {
  const user = useStore((s) => s.user);
  const setDialog = useUi((s) => s.setDialog);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className="rounded-full outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Demo Explorer account menu"
      >
        <Avatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <div className="flex items-center gap-3 px-3 pb-3 pt-2">
          <Avatar className="h-11 w-11" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Demo Explorer</p>
            <p className="text-xs text-muted">Guest account</p>
          </div>
        </div>
        <div className="mx-1 mb-1.5 rounded-xl border border-line bg-white/[0.03] px-3 py-2.5">
          <p className="text-[11px] uppercase tracking-wide text-subtle">Available cash</p>
          <p className="text-lg font-semibold tabular">{formatMoney(availableCents(user))}</p>
        </div>
        <DropdownMenuItem onSelect={() => setDialog('funds')}>
          <PlusCircle /> Add funds
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setDialog('reset')}>
          <RotateCcw /> Reset demo
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setDialog('settings')}>
          <Settings /> Settings & demo scenarios
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setDialog('about')}>
          <Info /> About this demo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
