import { expect, test } from '@playwright/test';

test('chart notes: numbered list quantifies each week and opens the note in News', async ({ page }) => {
  await page.goto('/markets/mars-2035');
  const chart = page.getByRole('region', { name: 'Probability history' });
  await expect(chart.getByRole('heading', { name: /What moved it/ })).toBeVisible();
  const items = chart.getByRole('listitem');
  await expect(items).toHaveCount(3);
  await expect(items.nth(2)).toContainText('Heavy-lift test campaign slips one quarter');
  await expect(items.nth(2)).toContainText('+1 pp');
  await chart.getByRole('button', { name: 'All' }).click();
  await expect(items).toHaveCount(3);
  await items.nth(1).getByRole('button').click();
  await expect(page).toHaveURL(/tab=news/);
  await expect(page.locator('#note-mars-2035-update-2')).toBeFocused();
});

test('price explainer shows probability, ask, bid and spread from the live quote', async ({ page }) => {
  await page.goto('/markets/mars-2035');
  await page.getByRole('button', { name: 'Why 49¢ and not 48%?' }).click();
  const pop = page.getByRole('dialog');
  await expect(pop.getByText('Probability vs. price')).toBeVisible();
  await expect(pop.getByText('48%', { exact: true })).toBeVisible();
  await expect(pop.getByText('49¢')).toBeVisible();
  await expect(pop.getByText('47¢')).toBeVisible();
  await expect(pop).toContainText('2¢ gap');
  await page.keyboard.press('Escape');
  await page.getByRole('radio', { name: /Buy No/ }).check({ force: true });
  await expect(page.getByRole('button', { name: 'Why 53¢ and not 52%?' })).toBeVisible();
});

test('pending order: simulated seller fills it in full at the limit', async ({ page }) => {
  await page.goto('/portfolio?tab=pending');
  await page.getByRole('button', { name: 'Demo: simulate a seller at 22¢' }).click();
  await expect(page.getByText('Limit order filled').first()).toBeVisible();
  await expect(page.getByText('No pending orders')).toBeVisible();
  await expect(page.getByTestId('cash-available')).toHaveText('$872.00');
  await expect(page.getByTestId('total-pnl')).toHaveText('+$5.60');
  await page.getByRole('tab', { name: /Active/ }).click();
  await expect(page.getByRole('article', { name: 'Apple will announce a foldable phone by 2027.' })).toBeVisible();
  await page.getByRole('tab', { name: /History/ }).click();
  await page.getByRole('button', { name: /^Trades/ }).click();
  await expect(page).toHaveURL(/filter=trades/);
  await expect(page.getByText('Limit order filled', { exact: true })).toBeVisible();
});

test('settled banner on Active after a settlement', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Demo Explorer account menu' }).click();
  await page.getByRole('menuitem', { name: /Settings/ }).click();
  await page.getByRole('dialog').getByRole('listitem').filter({ hasText: 'Fast-forward' }).getByRole('button', { name: 'Run' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).last().click();
  await page.goto('/portfolio');
  await expect(page.getByText('1 prediction settled this session · 1 correct')).toBeVisible();
  await page.getByRole('button', { name: 'View settled' }).click();
  await expect(page).toHaveURL(/filter=settled/);
});

test.describe('with motion enabled', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });
  test('animated numbers settle on the exact value and nothing errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Will a crewed mission land on Mars');
    await page.goto('/markets/mars-2035');
    await page.getByLabel('Amount to invest').fill('50');
    await page.getByRole('button', { name: 'Review prediction' }).click();
    await page.getByRole('button', { name: 'Confirm prediction' }).click();
    await expect(page.getByText('Your prediction is active!')).toBeVisible();
    await page.getByRole('link', { name: 'View your position' }).click();
    await expect(page.getByTestId('cash-available')).toHaveText('$822.02');
    await page.getByRole('button', { name: 'Add demo funds' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: /^Add/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Done' }).click();
    await expect(page.getByTestId('cash-available')).toHaveText('$1,322.02');
    await expect(page.getByTestId('portfolio-value')).toHaveText('$1,503.78');
    expect(errors).toEqual([]);
  });

  for (const [label, width] of [['desktop', 1440], ['phone', 390]] as const) {
    test(`main pages animate without errors or overflow (${label})`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.text()));
      for (const r of ['/', '/explore', '/explore?view=grid', '/markets/ucl-2027', '/markets/mars-2035?tab=news', '/portfolio', '/portfolio?tab=history']) {
        await page.goto(r);
        await page.waitForTimeout(1600); // let entrance animations finish
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(300);
        const extra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(extra, `${r} overflows`).toBeLessThanOrEqual(0);
      }
      expect(errors).toEqual([]);
    });
  }
});
