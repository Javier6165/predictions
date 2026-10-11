import { X } from 'lucide-react';
import { useUi } from '@/state/ui';
import { cn } from '@/lib/cn';

export function Toaster() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-2xl border bg-bg-elev/95 px-4 py-3 backdrop-blur-xl',
            t.tone === 'warn' ? 'border-warn/40' : t.tone === 'success' ? 'border-yes/30' : 'border-line-strong',
          )}
          style={{ boxShadow: 'var(--shadow-pop)' }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs text-muted">{t.description}</p>}
          </div>
          <button type="button" onClick={() => dismiss(t.id)} className="text-muted hover:text-ink" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
