import { expect, test } from '@playwright/test';

test('E2E-24 Mobile 390px: Explore → Detail → Buy → Receipt → Portfolio', async ({ page }) => {
  await page.goto('/explore');
  await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link')).toHaveText(['Home', 'Explore', 'Portfolio']);
  await page.getByRole('link', { name: 'Will the Celtics reach the 2027 NBA Finals?' }).click();
  await expect(page).toHaveURL(/\/markets\/nba-2027/);
  await page.getByRole('button', { name: 'Make a prediction' }).click();
  const sheet = page.getByRole('dialog');
  await sheet.getByLabel('Amount to invest').fill('25');
  await expect(sheet.getByText(/50 contracts at 50¢/)).toBeVisible();
  await sheet.getByRole('button', { name: 'Review prediction' }).click();
  const review = page.getByRole('dialog');
  await expect(review.getByText('The Celtics will reach the 2027 NBA Finals.')).toBeVisible();
  const confirm = review.getByRole('button', { name: 'Confirm prediction' });
  await confirm.scrollIntoViewIfNeeded();
  await expect(confirm).toBeInViewport();
  await confirm.click();
  await expect(review.getByText('Your prediction is active!')).toBeVisible();
  await review.getByRole('link', { name: 'View your position' }).click();
  await expect(page).toHaveURL(/\/portfolio/);
  await expect(page.getByRole('article', { name: 'The Celtics will reach the 2027 NBA Finals.' })).toBeVisible();
  await expect(page.getByTestId('cash-available')).toHaveText('$847.00');
  // No accidental horizontal scroll.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('Mobile search and filters sheet', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search markets', exact: true }).click();
  await page.getByRole('combobox', { name: 'Search markets' }).fill('ethereum');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/markets\/ethereum-8k/);
  await page.goto('/explore');
  await page.getByRole('button', { name: /^Filters/ }).click();
  await page.getByRole('dialog').getByRole('radio', { name: 'Multiple choice' }).click();
  await expect(page.getByRole('dialog').getByRole('radio', { name: 'Multiple choice' })).toBeChecked();
  await page.getByRole('dialog').getByRole('button', { name: 'Show 2 results' }).click();
  await expect(page).toHaveURL(/type=multi/);
  await expect(page.getByText('2 results')).toBeVisible();
});

test('short phone screen: no button collapses inside sheets and dialogs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  const check = async (label: string) => {
    const collapsed = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="dialog"] button'))
        .filter((b) => b.getBoundingClientRect().height < 12 && (b.textContent ?? '').trim().length > 2)
        .map((b) => b.textContent),
    );
    expect(collapsed, label).toEqual([]);
  };
  await page.goto('/explore');
  await page.getByRole('button', { name: /^Filters/ }).click();
  await check('filters sheet');
  await page.keyboard.press('Escape');
  await page.goto('/markets/ucl-2027');
  await page.getByRole('button', { name: 'Make a prediction' }).click();
  await page.getByRole('dialog').getByLabel('Amount to invest').fill('30');
  await check('ticket sheet');
  await page.getByRole('dialog').getByRole('button', { name: 'Review prediction' }).click();
  await check('review');
  await page.getByRole('button', { name: 'Confirm prediction' }).click();
  await check('receipt');
});
