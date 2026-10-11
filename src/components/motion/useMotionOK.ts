import { useReducedMotion } from 'motion/react';
import { useStore } from '@/state/store';

/**
 * Whether decorative motion may run: the in-app Settings toggle wins, otherwise
 * the OS `prefers-reduced-motion`. Always off in unit tests for determinism.
 */
export function useMotionOK(): boolean {
  const pref = useStore((s) => s.preferences.motion);
  const systemReduce = useReducedMotion();
  if (import.meta.env.MODE === 'test') return false;
  if (pref === 'reduce') return false;
  if (pref === 'full') return true;
  return !systemReduce;
}
