import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Compass, Home, Moon, PieChart, Plus, Search, Sun } from 'lucide-react';
import { BRAND, BrandMark, Wordmark } from '@/brand';
import { useStore } from '@/state/store';
import { resolveTheme } from '@/app/theme';
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
    <Link to="/" className="flex items-center gap-2 rounded-lg text-ink" aria-label={`${BRAND.name} home`}>
      <BrandMark className="h-[26px] w-[26px]" />
      <Wordmark />
    </Link>
  );
}

function ThemeToggle() {
  const pref = useStore((s) => s.preferences.theme);
  const setTheme = useStore((s) => s.setTheme);
  const dark = resolveTheme(pref) === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-ink/8 hover:text-ink"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
    </button>
  );
}

export function Navbar() {
  const setOverlay = useUi((s) => s.setOverlay);
  const setDialog = useUi((s) => s.setDialog);
  const overHero = false;
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
        <span className="hidden rounded-full bg-highlight px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-highlight xl:inline">
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
          className="glass ml-auto hidden h-10 w-full max-w-sm items-center gap-2.5 rounded-full px-4 text-left text-sm text-muted transition hover:border-ink/25 lg:flex"
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-ink/8 hover:text-ink lg:hidden"
            aria-label="Search markets"
          >
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle />
          <NotificationsPopover />
          <AccountMenu />
          <button
            type="button"
            onClick={() => setDialog('funds')}
            className="ml-1 hidden h-10 items-center gap-1.5 rounded-full bg-cta px-4 text-sm font-semibold text-on-cta transition hover:bg-cta-hover sm:inline-flex"
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
                  <n.icon className={cn('h-5 w-5', isActive && 'text-ink')} aria-hidden />
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
