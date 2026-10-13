import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FlaskConical, RotateCcw, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { hasSessionChanges, useStore } from '@/state/store';
import { useUi } from '@/state/ui';
import { DEMO_TOP_UPS_CENTS } from '@/domain/engine';
import { SCENARIOS } from '@/domain/scenarios';
import { portfolioSummary } from '@/domain/selectors';
import { catalog } from '@/data/fixtures';
import { formatDate, formatMoney, formatSignedMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import { AnimatedCheck } from '@/components/motion/AnimatedCheck';

function FundsDialog() {
  const open = useUi((s) => s.dialog === 'funds');
  const setDialog = useUi((s) => s.setDialog);
  const addFunds = useStore((s) => s.addFunds);
  const user = useStore((s) => s.user);
  const [amount, setAmount] = useState<number>(DEMO_TOP_UPS_CENTS[1]);
  const [done, setDone] = useState<number | null>(null);
  const summary = portfolioSummary(user, catalog);

  const close = () => {
    setDialog(null);
    setDone(null);
  };
  const confirm = () => {
    const r = addFunds(amount);
    if (r.ok) setDone(amount);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : close())}>
      <DialogContent className="p-6 sm:p-7">
        {done ? (
          <div className="py-2 text-center">
            <AnimatedCheck className="mx-auto h-14 w-14" />
            <DialogTitle className="mt-3 text-xl">{formatMoney(done)} added to your cash</DialogTitle>
            <DialogDescription className="mt-1.5">
              Available cash is now <span className="font-semibold text-ink">{formatMoney(summary.availableCents)}</span>. Your
              profit &amp; loss is unchanged at {formatSignedMoney(summary.totalPnLCents)} — top-ups are never counted as gains.
            </DialogDescription>
            <Button className="mt-6 w-full" size="lg" onClick={close}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Wallet className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <DialogTitle>Add funds</DialogTitle>
                <DialogDescription>Virtual dollars for this demo session. No card, bank or payment involved.</DialogDescription>
              </div>
            </div>
            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-medium text-ink-2">Amount</legend>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_TOP_UPS_CENTS.map((c) => (
                  <label
                    key={c}
                    className={cn(
                      'flex cursor-pointer items-center justify-center rounded-xl border py-3 text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent',
                      amount === c ? 'border-accent bg-accent-soft text-ink' : 'border-line-strong text-ink-2 hover:bg-white/5',
                    )}
                  >
                    <input type="radio" name="topup" className="sr-only" checked={amount === c} onChange={() => setAmount(c)} />
                    {formatMoney(c).replace('.00', '')}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="mt-4 rounded-xl border border-line bg-white/[0.03] px-3.5 py-3 text-xs leading-relaxed text-muted">
              Adds to your cash and portfolio value, and to “Funds added”. It does <strong className="text-ink-2">not</strong> change profit &amp; loss.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1" size="lg" onClick={close}>
                Cancel
              </Button>
              <Button className="flex-1" size="lg" onClick={confirm}>
                Add {formatMoney(amount).replace('.00', '')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResetDialog() {
  const open = useUi((s) => s.dialog === 'reset');
  const setDialog = useUi((s) => s.setDialog);
  const toast = useUi((s) => s.toast);
  const user = useStore((s) => s.user);
  const restore = useStore((s) => s.restoreShowcase);
  const fresh = useStore((s) => s.startFresh);
  const navigate = useNavigate();
  const [choice, setChoice] = useState<'showcase' | 'fresh'>('showcase');
  const dirty = hasSessionChanges(user);

  const apply = () => {
    if (choice === 'showcase') restore();
    else fresh();
    setDialog(null);
    toast({
      title: choice === 'showcase' ? 'Showcase restored' : 'Fresh demo account ready',
      description: choice === 'showcase' ? 'Four predictions, one pending order and $872.00 available.' : '$1,000.00 of demo cash and an empty portfolio.',
      tone: 'success',
    });
    navigate(choice === 'fresh' ? '/portfolio' : '/');
  };

  const options = [
    { id: 'showcase' as const, title: 'Restore showcase', body: 'Four open predictions, one pending limit order, three saved markets. The original walkthrough.' },
    { id: 'fresh' as const, title: 'Start fresh', body: '$1,000 of demo cash, no predictions, orders, saved markets or notifications.' },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => setDialog(o ? 'reset' : null)}>
      <DialogContent className="p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-ink">
            <RotateCcw className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <DialogTitle>Reset demo</DialogTitle>
            <DialogDescription>Choose how to restart this tab’s demo session.</DialogDescription>
          </div>
        </div>
        <div className="mt-5 grid gap-2.5" role="radiogroup" aria-label="Reset option">
          {options.map((o) => (
            <label
              key={o.id}
              className={cn(
                'flex cursor-pointer gap-3 rounded-2xl border p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent',
                choice === o.id ? 'border-accent bg-accent-soft' : 'border-line-strong hover:bg-white/[0.03]',
              )}
            >
              <input type="radio" name="reset" className="mt-1 accent-[#3b82f6]" checked={choice === o.id} onChange={() => setChoice(o.id)} />
              <span>
                <span className="block text-sm font-semibold">{o.title}</span>
                <span className="mt-0.5 block text-[13px] text-muted">{o.body}</span>
              </span>
            </label>
          ))}
        </div>
        {dirty && (
          <p className="mt-4 rounded-xl border border-warn/30 bg-warn-soft px-3.5 py-3 text-xs text-warn" role="note">
            This replaces everything you’ve done in this session — trades, orders, saved markets and notifications.
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" size="lg" onClick={() => setDialog(null)}>
            Cancel
          </Button>
          <Button className="flex-1" size="lg" onClick={apply}>
            {choice === 'showcase' ? 'Restore showcase' : 'Start fresh'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog() {
  const open = useUi((s) => s.dialog === 'settings');
  const setDialog = useUi((s) => s.setDialog);
  const toast = useUi((s) => s.toast);
  const motion = useStore((s) => s.preferences.motion);
  const setMotion = useStore((s) => s.setMotion);
  const active = useStore((s) => s.user.activeScenarios);
  const run = useStore((s) => s.runScenario);
  const setSettlement = useUi((s) => s.setSettlement);
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={(o) => setDialog(o ? 'settings' : null)}>
      <DialogContent className="p-6 sm:max-w-xl sm:p-7">
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>Preferences for this tab’s demo session.</DialogDescription>

        <section className="mt-5 rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold" id="motion-label">
                Reduce motion
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                {motion === 'system' ? 'Following your device setting.' : motion === 'reduce' ? 'Animations are minimised.' : 'Animations are on.'}
              </p>
            </div>
            <Switch
              aria-labelledby="motion-label"
              checked={motion === 'reduce'}
              onCheckedChange={(c) => setMotion(c ? 'reduce' : 'full')}
            />
          </div>
          {motion !== 'system' && (
            <button type="button" className="mt-2 text-xs text-accent hover:underline" onClick={() => setMotion('system')}>
              Use device setting
            </button>
          )}
        </section>

        <section className="mt-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-accent" aria-hidden />
            <h3 className="text-sm font-semibold">Demo scenarios</h3>
          </div>
          <p className="mt-1 text-xs text-muted">
            Explicit, repeatable events for testing edge cases. Nothing changes on its own; use Reset demo to undo.
          </p>
          <ul className="mt-3 grid gap-2">
            {SCENARIOS.map((s) => {
              const on = active.includes(s.id) && !s.repeatable;
              return (
                <li key={s.id} className="rounded-2xl border border-line p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{s.description}</p>
                    </div>
                    {on ? (
                      <Button size="sm" variant="secondary" onClick={() => { setDialog(null); navigate(s.path); }}>
                        View
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const r = run(s.id);
                          if (r.ok) {
                            if (r.filledOrders)
                              toast({ title: `${r.filledOrders} limit order${r.filledOrders === 1 ? '' : 's'} filled`, description: 'Held cash became the cost of the new contracts.', tone: 'success' });
                            else if (!r.settlement) toast({ title: `Scenario active: ${s.title}`, tone: 'info' });
                            setDialog(null);
                            navigate(s.path);
                            if (r.settlement) setSettlement(r.settlement);
                          } else toast({ title: r.message, tone: 'warn' });
                        }}
                      >
                        Run
                      </Button>
                    )}
                  </div>
                  {on && <p className="mt-2 text-[11px] font-medium text-yes">Active in this session</p>}
                </li>
              );
            })}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  );
}

function AboutDialog() {
  const open = useUi((s) => s.dialog === 'about');
  const setDialog = useUi((s) => s.setDialog);
  return (
    <Dialog open={open} onOpenChange={(o) => setDialog(o ? 'about' : null)}>
      <DialogContent className="p-6 sm:p-7">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <DialogTitle className="mt-4 text-xl">About this demo</DialogTitle>
        <DialogDescription className="mt-2 leading-relaxed">
          NOVA is a product-design concept exploring a simpler, prediction-first take on prediction markets. It is an interactive
          prototype, not a financial product.
        </DialogDescription>
        <ul className="mt-5 grid gap-3 text-sm text-ink-2">
          {[
            'Every market, price, chart, update and outcome is fictional demo data.',
            `Prices are frozen at a demo snapshot (${formatDate(catalog.displayAsOf)}). Nothing is live.`,
            'Money is virtual. There is no sign-in, payment, wallet, broker or exchange.',
            'Your session lives only in this browser tab and is cleared when you reset.',
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yes" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <Button className="mt-6 w-full" size="lg" variant="secondary" onClick={() => setDialog(null)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function AccountDialogs() {
  return (
    <>
      <FundsDialog />
      <ResetDialog />
      <SettingsDialog />
      <AboutDialog />
    </>
  );
}
