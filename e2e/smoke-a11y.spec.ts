import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import raw from '../data/demo-fixtures.v1.7.json' with { type: 'json' };

/**
 * Smoke crawl: every route and every market tab at desktop, tablet and phone widths
 * must render without console errors or horizontal overflow; key pages and every
 * overlay must have no WCAG 2.1 A/AA axe violations.
 */

const ids = (raw as { marketData: { id: string }[] }).marketData.map((m) => m.id);
const ROUTES = [
  '/', '/explore', '/explore?q=zzzz', '/explore?category=sports&type=multi', '/explore?sort=ending&status=closing',
  '/portfolio', '/portfolio?tab=pending', '/portfolio?tab=history', '/portfolio?tab=saved', '/nope',
  ...ids.flatMap((id) => ['', '?tab=news', '?tab=data', '?tab=rules'].map((t) => `/markets/${id}${t}`)),
];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`${page.url()} ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`${page.url()} ${m.text()}`);
  });
  return errors;
}

async function axe(page: Page, label: string, out: string[]) {
  const res = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  for (const v of res.violations) out.push(`${label}: ${v.id} → ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
}

for (const [name, width, height] of [
  ['desktop', 1440, 900],
  ['tablet', 768, 1024],
  ['phone', 390, 844],
] as const) {
  test(`crawl at ${name} width: no console errors, no horizontal overflow`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height });
    const errors = collectErrors(page);
    const overflow: string[] = [];
    for (const r of ROUTES) {
      await page.goto(r);
      await page.waitForLoadState('networkidle');
      const extra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (extra > 0) overflow.push(`${r} (+${extra}px)`);
    }
    expect(errors).toEqual([]);
    expect(overflow).toEqual([]);
  });
}

test('axe: key pages at desktop and phone widths', async ({ page }) => {
  test.setTimeout(120_000);
  const found: string[] = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const r of ['/', '/explore', '/explore?category=crypto', '/markets/ucl-2027', '/markets/mars-2035?tab=data', '/markets/global-event-resolved', '/portfolio', '/portfolio?tab=history', '/nope']) {
      await page.goto(r);
      await page.waitForLoadState('networkidle');
      await axe(page, `${width} ${r}`, found);
    }
  }
  expect(found).toEqual([]);
});

test('axe: overlays, dialogs and sheets', async ({ page }) => {
  test.setTimeout(120_000);
  const found: string[] = [];
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  await page.getByRole('combobox', { name: 'Search markets' }).fill('bit');
  await axe(page, 'search', found);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Notifications/ }).click();
  await axe(page, 'bell', found);
  await page.keyboard.press('Escape');
  for (const item of ['Add funds', 'Reset demo', /Settings/, 'About this demo']) {
    await page.getByRole('button', { name: 'Demo Explorer account menu' }).click();
    await page.getByRole('menuitem', { name: item }).click();
    await axe(page, `dialog ${item}`, found);
    await page.keyboard.press('Escape');
  }
  await page.goto('/markets/ucl-2027');
  await page.getByLabel('Amount to invest').fill('20');
  await page.getByRole('button', { name: /Advanced: limit order/ }).click();
  await page.getByRole('button', { name: 'Review prediction' }).click();
  await axe(page, 'review', found);
  await page.getByRole('button', { name: 'Confirm prediction' }).click();
  await expect(page.getByText('Your prediction is active!')).toBeVisible();
  await axe(page, 'receipt', found);
  await page.goto('/portfolio');
  await page.getByRole('complementary', { name: 'Selected position' }).getByRole('button', { name: 'Sell position' }).click();
  await axe(page, 'sell configure', found);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/markets/film-award-2027');
  await page.getByRole('button', { name: 'Make a prediction' }).click();
  await axe(page, 'ticket sheet', found);
  await page.keyboard.press('Escape');
  await page.goto('/explore');
  await page.getByRole('button', { name: /^Filters/ }).click();
  await axe(page, 'filters sheet', found);
  expect(found).toEqual([]);
});
