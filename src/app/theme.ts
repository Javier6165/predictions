import { useEffect, useState } from 'react';
import { useStore, type ThemePreference } from '@/state/store';

function systemDark() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  return pref === 'system' ? (systemDark() ? 'dark' : 'light') : pref;
}

/** Keeps <html data-theme> in sync with the saved preference (and the OS, for "system"). */
export function useApplyTheme() {
  const pref = useStore((s) => s.preferences.theme);
  const [, rerender] = useState(0);
  useEffect(() => {
    if (pref !== 'system' || typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = () => rerender((n) => n + 1);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [pref]);
  const theme = resolveTheme(pref);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f0e0c' : '#f2efe7');
  }, [theme]);
  return theme;
}
