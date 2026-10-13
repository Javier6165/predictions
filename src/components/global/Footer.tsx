import { catalog } from '@/data/fixtures';
import { formatDate } from '@/lib/format';
import { useUi } from '@/state/ui';

export function Footer() {
  const setDialog = useUi((s) => s.setDialog);
  return (
    <footer className="mt-20 border-t border-line pb-24 md:pb-0">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-4 py-8 text-xs text-subtle sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>
          <span className="font-semibold text-ink-2">NOVA</span> · Interactive demo · Snapshot {formatDate(catalog.displayAsOf)}
        </p>
        <p className="max-w-xl md:text-right">
                    <button type="button" className="text-ink-2 underline-offset-4 hover:underline" onClick={() => setDialog('about')}>
            About this demo
          </button>
        </p>
      </div>
    </footer>
  );
}
