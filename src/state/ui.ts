import { create } from 'zustand';

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
  toast: (t) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { ...t, id }] });
    setTimeout(() => get().dismissToast(id), 4200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
