/** Formatting helpers. Inputs are integer cents; output is display text only. */

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export function formatMoney(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${usd.format(Math.trunc(abs / 100) + (abs % 100) / 100)}`;
}

/** +$11.00 / -$4.80 / $0.00 */
export function formatSignedMoney(cents: number): string {
  if (cents === 0) return formatMoney(0);
  return `${cents > 0 ? '+' : '-'}${formatMoney(Math.abs(cents))}`;
}

/** Contract price, e.g. 40¢. Fractional average prices keep one decimal. */
export function formatPrice(cents: number): string {
  if (Number.isInteger(cents)) return `${cents}¢`;
  return `${(Math.round(cents * 10) / 10).toFixed(1)}¢`;
}

export function formatProbability(cents: number): string {
  return `${cents}%`;
}

/** Probability changes are percentage points, never percent. */
export function formatPp(delta: number): string {
  if (delta === 0) return '0 pp';
  return `${delta > 0 ? '+' : '−'}${Math.abs(delta)} pp`;
}

/** Relative return on cost, e.g. +27.5%. */
export function formatReturn(pnlCents: number, basisCents: number): string {
  if (basisCents <= 0) return '—';
  const pct = (pnlCents / basisCents) * 100;
  const rounded = Math.round(pct * 10) / 10;
  if (rounded === 0) return '0%';
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded).toFixed(Math.abs(rounded) >= 100 ? 0 : 1)}%`;
}

export function formatCompactMoney(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(dollars);
}

export function formatContracts(n: number): string {
  return `${n.toLocaleString('en-US')} contract${n === 1 ? '' : 's'}`;
}

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** Dates are shown in UTC so every visitor sees the same demo snapshot. */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return shortFmt.format(new Date(iso));
}

/** Time left relative to the frozen demo clock, never the visitor's clock. */
export function timeLeft(closeAtIso: string, nowIso: string): string {
  const ms = Date.parse(closeAtIso) - Date.parse(nowIso);
  if (ms <= 0) return 'Closed';
  const days = Math.floor(ms / 86_400_000);
  if (days >= 730) return `${Math.floor(days / 365)} years left`;
  if (days >= 365) return '1 year left';
  if (days >= 60) return `${Math.floor(days / 30)} months left`;
  if (days >= 1) return `${days} day${days === 1 ? '' : 's'} left`;
  const hours = Math.max(1, Math.floor(ms / 3_600_000));
  return `${hours}h left`;
}

/** Relative age vs the demo clock ("2 days ago"). */
export function ago(iso: string, nowIso: string): string {
  const ms = Date.parse(nowIso) - Date.parse(iso);
  if (ms < 60_000) return 'Just now';
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(iso);
}

/** Parse a user-typed dollar amount into integer cents without float drift. */
export function parseDollarsToCents(input: string): number | null {
  const clean = input.replace(/[$,\s]/g, '');
  if (clean === '') return null;
  const m = /^(\d{0,7})(?:\.(\d{0,2}))?$/.exec(clean);
  if (!m) return null;
  const whole = m[1] === '' ? 0 : Number(m[1]);
  const frac = (m[2] ?? '').padEnd(2, '0');
  return whole * 100 + Number(frac);
}
