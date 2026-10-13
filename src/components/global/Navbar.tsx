import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Compass, Home, PieChart, Plus, Search } from 'lucide-react';
import { useUi } from '@/state/ui';
import { cn } from '@/lib/cn';
import { Kbd } from '@/components/ui/misc';
import { motion } from 'motion/react';
import { useMotionOK } from '@/components/motion/useMotionOK';
import { NotificationsPopover } from './NotificationsPopover';
import { AccountMenu } from './AccountMenu';

export const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Compass, end: false },
  { to: '/portfolio', label: 'Portfolio', icon: PieChart, end: false },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-lg" aria-label="NOVA home">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c7cdff" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <path d="M8 24V8l16 16V8" stroke="url(#logo-g)" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[22px] font-bold tracking-[-0.04em] text-ink">NOVA</span>
    </Link>
  );
}

export function Navbar() {
  const { pathname } = useLocation();
  const setOverlay = useUi((s) => s.setOverlay);
  const setDialog = useUi((s) => s.setDialog);
  const overHero = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = !overHero || scrolled;
  const motionOK = useMotionOK();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-[background,border-color,backdrop-filter] duration-200',
        overHero && '-mb-[68px]',
        solid ? 'border-b border-line bg-bg/75 backdrop-blur-xl' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Logo />
        <span className="hidden rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-2 xl:inline">
          Demo
        </span>
        <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn('relative rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'text-ink' : 'text-ink-2 hover:text-ink')
              }
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-[15px] h-0.5 rounded-full bg-ink"
                      transition={motionOK ? { type: 'spring', stiffness: 500, damping: 40 } : { duration: 0 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOverlay('search')}
          className="glass ml-auto hidden h-10 w-full max-w-sm items-center gap-2.5 rounded-full px-4 text-left text-sm text-muted transition hover:border-white/25 lg:flex"
          aria-label="Search markets (Ctrl or Command + K)"
        >
          <Search className="h-4 w-4" aria-hidden />
          <span className="flex-1 truncate">Search markets, topics or events…</span>
          <Kbd>⌘K</Kbd>
        </button>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
          <button
            type="button"
            onClick={() => setOverlay('search')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-white/8 hover:text-ink lg:hidden"
            aria-label="Search markets"
          >
            <Search className="h-5 w-5" />
          </button>
          <NotificationsPopover />
          <AccountMenu />
          <button
            type="button"
            onClick={() => setDialog('funds')}
            className="ml-1 hidden h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:inline-flex"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add funds
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="grid grid-cols-3">
        {NAV.map((n) => (
          <li key={n.to}>
            <NavLink
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn('flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium', isActive ? 'text-ink' : 'text-muted')
              }
            >
              {({ isActive }) => (
                <>
                  <n.icon className={cn('h-5 w-5', isActive && 'text-accent')} aria-hidden />
                  {n.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
