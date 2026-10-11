import { expect, test, type Page } from '@playwright/test';

/** Each test gets a fresh browser context → fresh sessionStorage → showcase seed. */

const money = (page: Page, id: string) => page.getByTestId(id);

async function openReviewBuy(page: Page, amount: string) {
  await page.getByLabel('Amount to invest').fill(amount);
  await page.getByRole('button', { name: 'Review prediction' }).click();
  return page.getByRole('dialog');
}

async function runScenario(page: Page, title: string) {
  await page.getByRole('button', { name: 'Demo Explorer account menu' }).click();
  await page.getByRole('menuitem', { name: /Settings & demo scenarios/ }).click();
  const item = page.getByRole('dialog').getByRole('listitem').filter({ hasText: title });
  await item.getByRole('button', { name: 'Run' }).click();
}

test('E2E-01 cold entry lands on Home with demo badge and three destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Will a crewed mission land on Mars');
  await expect(page.getByText('Interactive demo · Simulated markets').first()).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Primary' }).first();
  await expect(nav.getByRole('link')).toHaveText(['Home', 'Explore', 'Portfolio']);
  await expect(page.getByText(/sign in|log in/i)).toHaveCount(0);
});

test('E2E-02 Home category opens Explore with the category applied', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="/explore?category=crypto"]').first().click();
  await expect(page).toHaveURL(/category=crypto/);
  await expect(page.getByText('3 results')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Will Bitcoin reach $150,000 before 2028?' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Mars/ })).toHaveCount(0);
});

test('E2E-03 Explore starts grouped with Filters collapsed', async ({ page }) => {
  await page.goto('/explore');
  await expect(page.getByRole('button', { name: /^Filters/ }).first()).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('complementary', { name: 'Filters' })).toHaveCount(0);
  for (const g of ['Politics', 'Sports', 'Crypto', 'Science & Climate']) await expect(page.getByRole('heading', { name: g, exact: true })).toBeVisible();
});

test('E2E-04 Explore filter → Detail → Back keeps the filter', async ({ page }) => {
  await page.goto('/explore');
  await page.getByRole('button', { name: /^Filters/ }).first().click();
  const panel = page.getByRole('complementary', { name: 'Filters' });
  await panel.getByRole('radio', { name: 'Awaiting result' }).click();
  await expect(panel.getByRole('radio', { name: 'Awaiting result' })).toBeChecked();
  await expect(page).toHaveURL(/status=pending/);
  await expect(page.getByText('1 result')).toBeVisible();
  await page.getByRole('link', { name: /October 2026 summit/ }).click();
  await expect(page).toHaveURL(/\/markets\/global-event-pending/);
  await page.goBack();
  await expect(page).toHaveURL(/status=pending/);
  await expect(page.getByRole('complementary', { name: 'Filters' }).getByRole('radio', { name: 'Awaiting result' })).toBeChecked();
});

test('E2E-05 Ctrl/Cmd+K search → Enter opens the exact market', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  const input = page.getByRole('combobox', { name: 'Search markets' });
  await expect(input).toBeFocused();
  await input.fill('bitcoin');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/markets\/bitcoin-150k-2027$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('E2E-06 Search → See all keeps q in Explore', async ({ page }) => {
  await page.goto('/portfolio');
  await page.getByRole('button', { name: /Search markets \(Ctrl/ }).click();
  await page.getByRole('combobox', { name: 'Search markets' }).fill('election');
  await page.getByRole('option', { name: /See all results for “election”/ }).click();
  await expect(page).toHaveURL(/\/explore\?q=election/);
  await expect(page.getByRole('button', { name: 'Remove filter “election”' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Elena Marlowe/ })).toBeVisible();
});

test('E2E-07/08/09 Buy YES: review, back keeps form, confirm reconciles portfolio', async ({ page }) => {
  await page.goto('/markets/mars-2035');
  await page.getByLabel('Amount to invest').fill('50');
  await expect(page.getByText(/102 contracts at 49¢/)).toBeVisible();
  await page.getByRole('button', { name: 'Review prediction' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('A crewed mission will land on Mars before 2035.')).toBeVisible();
  await expect(dialog.getByText('$49.98').first()).toBeVisible();
  await expect(dialog.getByText('−$49.98 (−100%)')).toBeVisible();
  await expect(dialog.getByText('Demo fees', { exact: true })).toBeVisible();

  // E2E-08: cancel review → nothing changed, form preserved.
  await dialog.getByRole('button', { name: 'Back to edit' }).click();
  await expect(page.getByLabel('Amount to invest')).toHaveValue('50');
  await expect(page.getByText('Available demo cash: $872.00')).toBeVisible();

  // E2E-09: confirm → receipt → portfolio.
  await page.getByRole('button', { name: 'Review prediction' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm prediction' }).click();
  await expect(page.getByRole('dialog').getByText('Your prediction is active!')).toBeVisible();
  await page.getByRole('link', { name: 'View your position' }).click();
  await expect(page).toHaveURL(/\/portfolio\?tab=active&position=pos-1/);
  await expect(money(page, 'cash-available')).toHaveText('$822.02');
  await expect(money(page, 'portfolio-value')).toHaveText('$1,003.78');
  await expect(money(page, 'total-pnl')).toHaveText('+$3.78');
  await expect(page.getByRole('complementary', { name: 'Selected position' }).getByText('202 contracts (Yes)')).toBeVisible();
});

test('E2E-10 Buy NO on a binary market states the exact negation', async ({ page }) => {
  await page.goto('/markets/mars-2035');
  await page.getByRole('radio', { name: /Buy No/ }).check({ force: true });
  const dialog = await openReviewBuy(page, '10');
  await expect(dialog.getByText('No crewed mission will land on Mars before 2035.')).toBeVisible();
  await expect(dialog.getByText('No contracts')).toBeVisible();
});

test('E2E-11 Multi-outcome NO on one club never names a rival', async ({ page }) => {
  await page.goto('/markets/ucl-2027');
  await page.getByRole('button', { name: 'Buy No on Barcelona at 85 cents' }).click();
  await expect(page.getByLabel('Outcome')).toHaveValue('barcelona');
  const dialog = await openReviewBuy(page, '17');
  await expect(dialog.getByText('Barcelona will not win the 2027 UEFA Champions League.')).toBeVisible();
  await expect(dialog.getByText(/Real Madrid will win|Bayern will win/)).toHaveCount(0);
  await expect(dialog.getByText('No contracts · Barcelona')).toBeVisible();
});

test('E2E-12/13 Sell part, then all, from Portfolio', async ({ page }) => {
  await page.goto('/portfolio');
  const panel = page.getByRole('complementary', { name: 'Selected position' });
  await panel.getByRole('button', { name: 'Sell position' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Contracts to sell').fill('50');
  await dialog.getByRole('button', { name: 'Review sale' }).click();
  await expect(dialog.getByText('You’re selling part of your prediction that')).toBeVisible();
  await expect(dialog.getByText('47¢')).toBeVisible();
  await expect(dialog.getByText('$23.50')).toBeVisible();
  await expect(dialog.getByText('$20.00')).toBeVisible();
  await expect(dialog.getByText('+$3.50 (+17.5%)')).toBeVisible();
  await dialog.getByRole('button', { name: 'Confirm sale' }).click();
  await expect(dialog.getByText('Sale confirmed')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(money(page, 'cash-available')).toHaveText('$895.50');
  await expect(panel.getByText('50 contracts (Yes)')).toBeVisible();

  // Sell the rest.
  await panel.getByRole('button', { name: 'Sell position' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'All' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Review sale' }).click();
  await expect(page.getByRole('dialog').getByText('50 (all)')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm sale' }).click();
  await expect(page.getByRole('dialog').getByText('Contracts left')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('article', { name: /crewed mission/ })).toHaveCount(0);
  await expect(money(page, 'sum-realized-p-l')).toHaveText('+$7.00');
  await page.getByRole('tab', { name: /History/ }).click();
  await expect(page.getByText('Sold').first()).toBeVisible();
});

test('E2E-14 Limit buy → Pending → Cancel releases the reserve', async ({ page }) => {
  await page.goto('/markets/mars-2035');
  await page.getByRole('button', { name: /Advanced: limit order/ }).click();
  await page.getByLabel('Limit price (¢)').fill('40');
  await page.getByLabel('Contracts').fill('10');
  await expect(page.getByText('Holds $4.00')).toBeVisible();
  await page.getByRole('button', { name: 'Review limit order' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Place limit order' }).click();
  await expect(page.getByRole('dialog').getByText('Limit order placed')).toBeVisible();
  await page.getByRole('link', { name: 'View pending orders' }).click();
  await expect(money(page, 'cash-available')).toHaveText('$868.00');
  await expect(money(page, 'portfolio-value')).toHaveText('$1,004.80');
  const row = page.getByRole('listitem').filter({ hasText: 'limit 40¢' });
  await row.getByRole('button', { name: 'Cancel order' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel order' }).click();
  await expect(money(page, 'cash-available')).toHaveText('$872.00');
  await expect(page.getByRole('listitem').filter({ hasText: 'limit 40¢' })).toHaveCount(0);
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('E2E-15 Saved toggle is reflected in Portfolio › Saved', async ({ page }) => {
  await page.goto('/explore');
  await page.getByRole('button', { name: 'Save Oil price' }).click();
  await expect(page.getByRole('button', { name: 'Remove Oil price' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/portfolio?tab=saved');
  await expect(page.getByRole('tab', { name: /Saved markets/ })).toContainText('4');
  await expect(page.getByRole('link', { name: 'Will oil trade above $110 in 2027?' })).toBeVisible();
  await page.getByRole('button', { name: 'Remove Oil price' }).click();
  await expect(page.getByRole('link', { name: 'Will oil trade above $110 in 2027?' })).toHaveCount(0);
});

test('E2E-16 Bell notification navigates and marks read; Search closes Bell', async ({ page }) => {
  await page.goto('/portfolio');
  const bell = page.getByRole('button', { name: /Notifications, 1 unread/ });
  await bell.click();
  await expect(page.getByRole('dialog', { name: 'Notifications' })).toBeVisible();
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.getByRole('dialog', { name: 'Notifications' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Notifications, 1 unread/ }).click();
  await page.getByRole('button', { name: /Your prediction moved/ }).click();
  await expect(page).toHaveURL(/\/markets\/mars-2035/);
  await expect(page.getByRole('button', { name: 'Notifications' })).toBeVisible();
});

test('E2E-17 Add demo funds grows cash but not P&L', async ({ page }) => {
  await page.goto('/portfolio');
  await page.getByRole('button', { name: 'Add demo funds' }).first().click();
  await page.getByText('$500', { exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Add $500' }).click();
  await expect(page.getByRole('dialog').getByText('$500.00 demo funds added')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Done' }).click();
  await expect(money(page, 'cash-available')).toHaveText('$1,372.00');
  await expect(money(page, 'portfolio-value')).toHaveText('$1,504.80');
  await expect(money(page, 'total-pnl')).toHaveText('+$4.80');
});

test('E2E-18 Reload in the same tab keeps the trade without repeating it', async ({ page }) => {
  await page.goto('/markets/oil-2027');
  await openReviewBuy(page, '20');
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm prediction' }).click();
  await expect(page.getByRole('dialog').getByText('Your prediction is active!')).toBeVisible();
  await page.goto('/portfolio');
  const cash = await money(page, 'cash-available').textContent();
  await page.reload();
  await expect(money(page, 'cash-available')).toHaveText(cash!);
  await expect(page.getByRole('article', { name: 'Oil will trade above $110 in 2027.' })).toBeVisible();
  await page.getByRole('tab', { name: /History/ }).click();
  await expect(page.getByText('Oil will trade above $110 in 2027.')).toHaveCount(1);
});

test('E2E-19/20 Restore showcase and Start fresh', async ({ page }) => {
  await page.goto('/portfolio');
  await page.getByRole('button', { name: 'Add demo funds' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /^Add/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Done' }).click();

  await page.getByRole('button', { name: 'Demo Explorer account menu' }).click();
  await page.getByRole('menuitem', { name: 'Reset demo' }).click();
  await expect(page.getByRole('dialog').getByText(/replaces everything/)).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Restore showcase' }).click();
  await page.goto('/portfolio');
  await expect(money(page, 'portfolio-value')).toHaveText('$1,004.80');
  await expect(money(page, 'cash-available')).toHaveText('$872.00');

  await page.getByRole('button', { name: 'Demo Explorer account menu' }).click();
  await page.getByRole('menuitem', { name: 'Reset demo' }).click();
  await page.getByRole('radio', { name: /Start fresh/ }).check();
  await page.getByRole('dialog').getByRole('button', { name: 'Start fresh' }).click();
  await expect(page).toHaveURL(/\/portfolio$/);
  await expect(page.getByText('You don’t have any predictions yet')).toBeVisible();
  await expect(money(page, 'cash-available')).toHaveText('$1,000.00');
  await expect(money(page, 'total-pnl')).toHaveText('$0.00');
  await expect(page.getByRole('link', { name: /Explore markets/ }).first()).toBeVisible();
});

test('E2E-21 Resolved market shows result and blocks trading', async ({ page }) => {
  await page.goto('/markets/global-event-resolved');
  await expect(page.getByText('Resolved YES').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Review prediction' })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Rules' }).click();
  await expect(page.getByText('Resolves YES if')).toBeVisible();
});

test('E2E-22 Invalid market id shows a helpful 404', async ({ page }) => {
  await page.goto('/markets/does-not-exist');
  await expect(page.getByRole('heading', { name: 'Market not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Back to Home/ })).toBeVisible();
  await page.getByRole('link', { name: /Explore markets/ }).first().click();
  await expect(page).toHaveURL(/\/explore$/);
});

test('E2E-23/26 Keyboard: search, review via Enter, Escape restores focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  await page.keyboard.type('mars');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/markets\/mars-2035/);
  const amount = page.getByLabel('Amount to invest');
  await amount.focus();
  await page.keyboard.type('25');
  // Tab forward to the Review button and activate it with the keyboard.
  const review = page.getByRole('button', { name: 'Review prediction' });
  for (let i = 0; i < 8 && !(await review.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(review).toBeFocused();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Confirm prediction' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(review).toBeFocused();
});

test('E2E-25 Price change before confirm forces a new review', async ({ page }) => {
  await page.goto('/');
  await runScenario(page, 'Price moves before you confirm');
  await expect(page).toHaveURL(/\/markets\/mars-2035/);
  const dialog = await openReviewBuy(page, '50');
  await expect(dialog.getByText('Demo scenario armed')).toBeVisible();
  await dialog.getByRole('button', { name: 'Confirm prediction' }).click();
  await expect(dialog.getByRole('alert')).toContainText('changed from 49¢ to 52¢');
  await expect(dialog.getByText('Your prediction is active!')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Confirm at 52¢' }).click();
  await expect(dialog.getByText('Your prediction is active!')).toBeVisible();
  await expect(dialog.getByText('96', { exact: true })).toBeVisible();
});

test('Scenario: limited liquidity rejects in full', async ({ page }) => {
  await page.goto('/');
  await runScenario(page, 'Limited liquidity');
  await page.getByLabel('Amount to invest').fill('10');
  await expect(page.getByRole('alert')).toContainText('at most 5 contracts');
  await expect(page.getByRole('button', { name: 'Review prediction' })).toBeDisabled();
});

test('Scenario: suspended market keeps holdings but blocks trading', async ({ page }) => {
  await page.goto('/');
  await runScenario(page, 'Suspend a market');
  await expect(page.getByText('Trading is paused on this market').first()).toBeVisible();
  await expect(page.getByLabel('Amount to invest')).toHaveCount(0);
  await page.goto('/portfolio');
  await expect(page.getByRole('article', { name: /crewed mission/ })).toBeVisible();
});

test('Scenario: settlement pays out once', async ({ page }) => {
  await page.goto('/');
  await runScenario(page, 'Fast-forward: settle the Champions League');
  await expect(page).toHaveURL(/tab=history/);
  await expect(page.getByText('Settled · won')).toBeVisible();
  await expect(money(page, 'cash-available')).toHaveText('$912.00');
  await expect(money(page, 'sum-realized-p-l')).toHaveText('+$16.00');
  await page.reload();
  await expect(page.getByText('Settled · won')).toHaveCount(1);
});

test('E2E-27 No real-money surface', async ({ page }) => {
  for (const path of ['/', '/explore', '/markets/mars-2035', '/portfolio']) {
    await page.goto(path);
    await expect(page.locator('input[type="password"], input[autocomplete="cc-number"]')).toHaveCount(0);
    await expect(page.getByText(/sign in|log in|credit card|bank account|wallet address/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Deposit$/ })).toHaveCount(0);
  }
});
