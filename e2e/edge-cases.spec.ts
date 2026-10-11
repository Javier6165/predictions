import { expect, test } from '@playwright/test';

test('double click confirm executes once', async ({ page }) => {
  await page.goto('/markets/exoplanet-2027');
  await page.getByLabel('Amount to invest').fill('19');
  await page.getByRole('button', { name: 'Review prediction' }).click();
  await page.getByRole('button', { name: 'Confirm prediction' }).dblclick();
  await expect(page.getByText('Your prediction is active!')).toBeVisible();
  await page.goto('/portfolio?tab=history');
  await expect(page.getByText('Scientists will confirm a potentially habitable exoplanet by 2027.')).toHaveCount(1);
});

test('reload during review never trades', async ({ page }) => {
  await page.goto('/markets/oil-2027');
  await page.getByLabel('Amount to invest').fill('30');
  await page.getByRole('button', { name: 'Review prediction' }).click();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/portfolio');
  await expect(page.getByTestId('cash-available')).toHaveText('$872.00');
});

test('sell from market detail Sell tab', async ({ page }) => {
  await page.goto('/markets/bitcoin-150k-2027');
  await page.getByRole('tab', { name: /Sell/ }).click();
  await page.getByLabel('Contracts to sell').fill('30');
  await expect(page.getByText('Realized profit / loss')).toBeVisible();
  await page.getByRole('button', { name: 'Review sale' }).click();
  const d = page.getByRole('dialog');
  await expect(d.getByText('Bitcoin will not reach $150,000 before 2028.')).toBeVisible();
  await expect(d.getByText('30 of 80')).toBeVisible();
  await d.getByRole('button', { name: 'Confirm sale' }).click();
  await expect(d.getByText('Sale confirmed')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText(/50 contracts · invested/)).toBeVisible();
});

test('limit order on a multi-outcome NO', async ({ page }) => {
  await page.goto('/markets/film-award-2027');
  await page.getByLabel('Outcome').selectOption('comedy');
  await page.getByRole('radio', { name: /Buy No/ }).check({ force: true });
  await page.getByRole('button', { name: /Advanced: limit order/ }).click();
  await page.getByLabel('Limit price (¢)').fill('80');
  await page.getByLabel('Contracts').fill('5');
  await page.getByRole('button', { name: 'Review limit order' }).click();
  await expect(page.getByRole('dialog').getByText('A comedy will not win Best Picture at the fictional 2027 Film Awards.')).toBeVisible();
  await page.getByRole('button', { name: 'Place limit order' }).click();
  await page.getByRole('link', { name: 'View pending orders' }).click();
  await expect(page.getByText('A comedy will not win Best Picture at the fictional 2027 Film Awards.')).toBeVisible();
  await expect(page.getByTestId('cash-available')).toHaveText('$868.00');
});

test('fresh account: buy, notification opens the position', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Demo Explorer account menu' }).click();
  await page.getByRole('menuitem', { name: 'Reset demo' }).click();
  await page.getByRole('radio', { name: /Start fresh/ }).check();
  await page.getByRole('dialog').getByRole('button', { name: 'Start fresh' }).click();
  await expect(page.getByRole('button', { name: 'Notifications' })).toBeVisible();
  await page.getByRole('tab', { name: /Pending/ }).click();
  await expect(page.getByText('No pending orders')).toBeVisible();
  await page.goto('/markets/ucl-2027');
  await page.getByRole('button', { name: 'Buy Yes on Barcelona at 17 cents' }).click();
  await page.getByLabel('Amount to invest').fill('10');
  await page.getByRole('button', { name: 'Review prediction' }).click();
  await page.getByRole('button', { name: 'Confirm prediction' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Notifications, 1 unread/ }).click();
  await page.getByRole('button', { name: /Your prediction is active/ }).click();
  await expect(page).toHaveURL(/portfolio\?tab=active&position=/);
  await expect(page.getByRole('complementary', { name: 'Selected position' }).getByText('Barcelona will win the 2027 UEFA Champions League.')).toBeVisible();
  await expect(page.getByTestId('cash-available')).toHaveText('$990.14');
});

test('odd amount inputs', async ({ page }) => {
  await page.goto('/markets/mars-2035');
  const input = page.getByLabel('Amount to invest');
  for (const v of ['abc', '-5', '1.234', '$1,000,000,000']) {
    await input.fill(v);
    await expect(page.getByRole('button', { name: 'Review prediction' })).toBeDisabled();
  }
  await input.fill('0');
  await expect(page.getByRole('button', { name: 'Review prediction' })).toBeDisabled();
  await input.fill('$1,000');
  await expect(page.getByRole('alert')).toBeVisible();
  await input.fill('12.5');
  await expect(page.getByText(/25 contracts at 49¢/)).toBeVisible();
});

test('settle scenario: market shows resolved, rerun is refused', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Demo Explorer account menu' }).click();
    await page.getByRole('menuitem', { name: /Settings/ }).click();
    const item = page.getByRole('dialog').getByRole('listitem').filter({ hasText: 'Fast-forward' });
    if (i === 0) await item.getByRole('button', { name: 'Run' }).click();
    else { await expect(item.getByText('Active in this session')).toBeVisible(); await item.getByRole('button', { name: 'View' }).click(); }
  }
  await page.goto('/markets/ucl-2027');
  await expect(page.getByText('Real Madrid won').first()).toBeVisible();
  await expect(page.getByLabel('Amount to invest')).toHaveCount(0);
  await expect(page.getByText('Your predictions here')).toHaveCount(0);
});

test('explore no results + back restores scroll', async ({ page }) => {
  await page.goto('/explore?q=qwertyuiop');
  await expect(page.getByText('No markets match these filters.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).last().click();
  await expect(page).toHaveURL(/\/explore$/);
  await page.evaluate(() => window.scrollTo(0, 2200));
  await page.waitForTimeout(300);
  const link = page.getByRole('link', { name: 'Will scientists confirm a potentially habitable exoplanet by 2027?' });
  await link.scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(500);
  await link.click();
  await expect(page).toHaveURL(/exoplanet/);
  await page.goBack();
  await page.waitForTimeout(300);
  const y2 = await page.evaluate(() => window.scrollY);
  expect(Math.abs(y2 - y)).toBeLessThan(60);
});

test('save from detail appears in portfolio saved', async ({ page }) => {
  await page.goto('/markets/festival-2027');
  await page.getByRole('button', { name: 'Save New global festival' }).first().click();
  await page.getByRole('link', { name: 'Portfolio' }).first().click();
  await page.getByRole('tab', { name: /Saved/ }).click();
  await expect(page.getByRole('link', { name: 'Will the fictional Horizon Sound festival be announced by 2027?' })).toBeVisible();
});
