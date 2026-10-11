import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '@/app/router';
import { useStore } from '@/state/store';
import { useUi } from '@/state/ui';
import { applyExploreFilters } from '@/pages/Explore';
import { searchMarkets } from '@/lib/search';
import { catalog } from '@/data/fixtures';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  useStore.getState().restoreShowcase();
  useUi.setState({ overlay: null, dialog: null, toasts: [] });
});

describe('Market detail ticket', () => {
  it('Review does not mutate; Back keeps the form; Confirm executes once', async () => {
    const user = userEvent.setup();
    renderAt('/markets/mars-2035');
    const cash0 = useStore.getState().user.cashTotalCents;

    await user.type(screen.getByLabelText('Amount to invest'), '50');
    expect(screen.getByText(/102 contracts at 49¢/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Review prediction' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('A crewed mission will land on Mars before 2035.')).toBeInTheDocument();
    expect(useStore.getState().user.cashTotalCents).toBe(cash0);

    await user.click(within(dialog).getByRole('button', { name: 'Back to edit' }));
    expect(screen.getByLabelText('Amount to invest')).toHaveValue('50');

    await user.click(screen.getByRole('button', { name: 'Review prediction' }));
    const confirm = within(await screen.findByRole('dialog')).getByRole('button', { name: 'Confirm prediction' });
    await user.click(confirm);
    expect(await screen.findByText('Your prediction is active!')).toBeInTheDocument();
    expect(useStore.getState().user.cashTotalCents).toBe(cash0 - 4998);
    expect(useStore.getState().user.ledger.filter((l) => l.kind === 'BUY' && l.intentId)).toHaveLength(1);
  });

  it('switching to NO updates the sentence, price and contracts', async () => {
    const user = userEvent.setup();
    renderAt('/markets/mars-2035');
    await user.type(screen.getByLabelText('Amount to invest'), '50');
    await user.click(screen.getByRole('radio', { name: /Buy No/ }));
    expect(screen.getByText(/94 contracts at 53¢/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Review prediction' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('No crewed mission will land on Mars before 2035.')).toBeInTheDocument();
  });

  it('a budget below one contract and insufficient cash give specific errors', async () => {
    const user = userEvent.setup();
    renderAt('/markets/mars-2035');
    const input = screen.getByLabelText('Amount to invest');
    await user.type(input, '0.30');
    expect(screen.getByRole('alert')).toHaveTextContent('below the price of one contract (49¢)');
    await user.clear(input);
    await user.type(input, '900');
    expect(screen.getByRole('alert')).toHaveTextContent('have $872.00 of demo cash available');
    expect(screen.getByRole('button', { name: 'Review prediction' })).toBeDisabled();
  });

  it('a market awaiting resolution shows status instead of a ticket', () => {
    renderAt('/markets/global-event-pending');
    expect(screen.queryByLabelText('Amount to invest')).not.toBeInTheDocument();
    expect(screen.getAllByText(/awaiting its demo resolution/).length).toBeGreaterThan(0);
  });
});

describe('Portfolio tabs', () => {
  it('Active, Pending, History and Saved show distinct things', async () => {
    const user = userEvent.setup();
    renderAt('/portfolio');
    expect(screen.getAllByRole('article')).toHaveLength(4);
    await user.click(screen.getByRole('tab', { name: /Pending orders/ }));
    expect(screen.getByText(/limit 22¢/)).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /Saved markets/ }));
    expect(screen.getByRole('link', { name: 'Will a robotaxi service launch in three more US cities by 2027?' })).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});

describe('Explore filtering', () => {
  const base = { q: '', status: 'all' as const, type: 'all' as const, sort: 'trending' as const };
  it('filters by category, type and status', () => {
    expect(applyExploreFilters(catalog.markets, { ...base, category: 'Crypto' })).toHaveLength(3);
    expect(applyExploreFilters(catalog.markets, { ...base, type: 'multi' }).map((m) => m.id).sort()).toEqual(['film-award-2027', 'ucl-2027']);
    expect(applyExploreFilters(catalog.markets, { ...base, status: 'resolved' }).map((m) => m.id)).toEqual(['global-event-resolved']);
  });
  it('search matches outcomes and returns nothing for gibberish', () => {
    expect(searchMarkets(catalog.markets, 'real madrid').map((m) => m.id)).toContain('ucl-2027');
    expect(searchMarkets(catalog.markets, 'zzzz')).toHaveLength(0);
  });
});
