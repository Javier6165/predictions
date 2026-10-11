import { create } from 'zustand';
import type { SettlementReceipt } from '@/domain/engine';

export type Overlay = 'search' | 'bell' | null;
export type AccountDialog = 'funds' | 'reset' | 'settings' | 'about' | null;

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone?: 'info' | 'success' | 'warn';
}

interface UiStore {
  /** Search and Bell are mutually exclusive: opening one closes the other. */
  overlay: Overlay;
  setOverlay: (o: Overlay) => void;
  dialog: AccountDialog;
  setDialog: (d: AccountDialog) => void;
  toasts: Toast[];
  /** Result of a settlement shown once as a dedicated moment (not persisted). */
  settlement: SettlementReceipt | null;
  setSettlement: (r: SettlementReceipt | null) => void;
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useUi = create<UiStore>()((set, get) => ({
  overlay: null,
  setOverlay: (overlay) => set({ overlay }),
  dialog: null,
  setDialog: (dialog) => set({ dialog, overlay: null }),
  toasts: [],
  settlement: null,
  setSettlement: (settlement) => set({ settlement }),
  toast: (t) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { ...t, id }] });
    setTimeout(() => get().dismissToast(id), 4200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
