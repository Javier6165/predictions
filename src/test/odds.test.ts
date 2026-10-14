import { describe, expect, it } from 'vitest';
import { allocate } from '@/components/markets/Odds';
import { resolveTheme } from '@/app/theme';

describe('dot allocation (100-dot odds)', () => {
  it('always adds up to exactly 100 and keeps binary splits exact', () => {
    expect(allocate([48, 52])).toEqual([48, 52]);
    expect(allocate([58, 16, 12, 14])).toEqual([58, 16, 12, 14]);
    for (const v of [[33, 33, 33], [1, 1, 1], [70, 20, 9.5], [0, 0]]) expect(allocate(v).reduce((a, b) => a + b, 0)).toBe(100);
  });
  it('uses largest remainders, so no segment is off by more than one dot', () => {
    const out = allocate([33.4, 33.3, 33.3]);
    expect(out).toEqual([34, 33, 33]);
  });
});

describe('theme preference', () => {
  it('maps explicit choices directly', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });
});
