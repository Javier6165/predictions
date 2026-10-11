import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { Navbar, MobileNav } from '@/components/global/Navbar';
import { Footer } from '@/components/global/Footer';
import { SearchDialog } from '@/components/global/SearchDialog';
import { AccountDialogs } from '@/components/global/AccountDialogs';
import { Toaster } from '@/components/global/Toaster';
import { useStore } from '@/state/store';
import { useUi } from '@/state/ui';

export function Layout() {
  const motion = useStore((s) => s.preferences.motion);
  const recovered = useStore((s) => s.sessionRecovered);
  const dismissRecovered = useStore((s) => s.dismissRecovered);
  const toast = useUi((s) => s.toast);
  const setOverlay = useUi((s) => s.setOverlay);
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.dataset.motion = motion;
  }, [motion]);

  useEffect(() => {
    if (recovered) {
      toast({ title: 'We restored the demo', description: 'Your previous session was from an older version, so the showcase was reloaded.', tone: 'info' });
      dismissRecovered();
    }
  }, [recovered, toast, dismissRecovered]);

  // Close transient overlays on navigation.
  useEffect(() => setOverlay(null), [pathname, setOverlay]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-[70] rounded-lg bg-cta px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <SearchDialog />
      <AccountDialogs />
      <Toaster />
      <ScrollRestoration />
    </div>
  );
}
