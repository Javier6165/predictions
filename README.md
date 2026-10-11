# NOVA — Prediction Market 2.0 (interactive demo)

A product-design concept for a simpler, **prediction-first** prediction market, built as a working single-page app. Every market, price, chart, note and outcome is **fictional demo data**; money is **virtual**. There is no backend, sign-in, payment, wallet, broker or live data.

> Interactive demo · Simulated markets · Demo snapshot · 10 Oct 2026

The handoff spec this app implements lives in this repo: [`CLAUDE.md`](CLAUDE.md), [`PROMPT_MAESTRO_PARA_CLAUDE_CODE.md`](PROMPT_MAESTRO_PARA_CLAUDE_CODE.md), [`docs/`](docs) (blueprint, implementation contract, QA plan, design references) and [`data/demo-fixtures.v1.7.json`](data/demo-fixtures.v1.7.json).

---

## Run it

Requires Node 20+ (tested with Node 22 / npm 10).

```bash
npm install
npm run dev            # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run test` | Vitest: domain math (FIN-01..22), store persistence, UI components |
| `npm run test:e2e` | Playwright E2E (builds and serves on :4173) |
| `npm run validate:fixtures` | Stand-alone Python fixture validator (stdlib only) |

Playwright uses its own Chromium. If you already have one installed elsewhere, point to it with `PW_CHROMIUM_PATH=/path/to/chrome npm run test:e2e`.

## Deploy

It's a static SPA. Build with `npm run build` and serve `dist/` with a fallback to `index.html` so deep links such as `/markets/mars-2035` survive a reload.

- **Vercel** — import the GitHub repo; `vercel.json` already rewrites every path to `/index.html`. Build command `npm run build`, output `dist`.
- **Netlify** — build `npm run build`, publish `dist`; `public/_redirects` (`/* /index.html 200`) is copied into the build.
- **Replit** — *Import from GitHub*, then run `npm install && npm run dev -- --host 0.0.0.0`. For a deployment use `npm run build` + `npm run preview -- --host 0.0.0.0`.

No environment variables or API keys are needed.

## What you can do

You arrive already inside the **Demo Explorer** account with a reconciled showcase portfolio:

| | Value |
|---|---|
| Demo funds added | $1,000.00 |
| Cash total / held for a pending order / available | $876.40 / $4.40 / **$872.00** |
| 4 open predictions, cost / current value | $123.60 / $128.40 |
| **Portfolio value** | **$1,004.80** (P&L +$4.80) |

Routes: `/` Home · `/explore` (filters in the URL: `?category=&q=&status=&type=&sort=`) · `/markets/:id` (`?tab=news|data|rules`, `?side=YES|NO`, `?outcome=`) · `/portfolio` (`?tab=active|pending|history|saved`). Unknown routes and market ids show a helpful 404.

**Discover** — Home (featured hero, spotlight, categories, Trending, Biggest movers in pp, Insights notes, Closing soon) and Explore (grouped by category by default; searching/filtering switches to one sorted list; Filters panel collapsed by default; list/grid). Global search with `Ctrl/⌘ + K`; notifications bell; bookmarks that sync everywhere.

**Predict** — On a market, choose the outcome and **Yes/No**; the ticket shows the exact sentence you're backing ("Real Madrid will not win…"). Enter a dollar amount → whole contracts at the **ask**, unused cents shown → **Review** (cost, payout if right, profit, max loss, $0 demo fees, resolution rule) → **Confirm** → **Receipt**. Nothing changes until Confirm; confirming twice never double-executes.

**Manage** — Portfolio › Active: select a prediction → **Sell position** (partial or all, at the **bid**, with realized P&L) or **Buy more**. Market detail › *Advanced: limit order* places a resting BUY that **holds cash** and shows under Pending, where you can **Cancel** it. History lists every buy, sale, order, top-up and settlement.

**Demo account** (avatar menu) — *Add demo funds* ($250/$500/$1,000; never counted as profit), *Reset demo* (**Restore showcase** or **Start fresh** with $1,000 and an empty portfolio), *Settings* (reduce motion, demo scenarios), *About this demo*.

### Reproducible scenarios (Settings › Demo scenarios)

| Scenario | Try this |
|---|---|
| Price moves before you confirm | Opens Mars. Review a Yes buy and press Confirm → nothing executes, you're asked to confirm again at 52¢. |
| Limited liquidity | Opens Mars. Any buy over 5 contracts is rejected in full (no partial or phantom fills). |
| Suspend a market | Mars stops trading; your holding stays in Portfolio. |
| Fast-forward: settle the Champions League | Real Madrid wins; the showcase's 40 Yes contracts pay $40.00 once (realized +$16.00). |

Also built in: the **resolved** market `/markets/global-event-resolved` and the **awaiting result** market `/markets/global-event-pending` (no trading).

### Session

State lives in **`sessionStorage`** (per tab, versioned and validated with Zod). It survives navigation and reloads in the same tab; a new tab starts from the showcase. Browsers that restore or duplicate tabs may copy the session — use *Reset demo* for a guaranteed clean start. Nothing is written to `localStorage`; Explore's filter-panel and list/grid choices are also kept in `sessionStorage`.

## How it's built

React 19 + TypeScript + Vite 7 · React Router 7 · Tailwind CSS 4 with design tokens · Radix primitives in shadcn/ui style (`src/components/ui`) · cmdk · Zustand · Recharts · Zod · Vitest + Testing Library · Playwright.

```
data/                 demo-fixtures.v1.7.json (single source of market + seed data)
src/domain/           pure, integer-cent engine: quotes, engine (buy/sell/limit/cancel/settle/funds),
                      selectors (marks, P&L, portfolio), copy (prediction sentences), scenarios
src/data/             fixture loader + Zod schema, categories, propositions, editorial framing
src/state/            Zustand store (sessionStorage) and UI store (overlays, dialogs, toasts)
src/components/       ui primitives, global chrome, markets, trading flow, generated art
src/pages/            Home, Explore, MarketDetail, Portfolio, NotFound
e2e/                  Playwright specs (desktop + 390px mobile)
docs/qa/              QA screenshots (desktop 1440px, mobile 390px)
```

Money rules: all amounts are **integer cents**, quantities are whole contracts, a winning contract pays 100¢. The displayed **probability (mark)** values positions; **ask** is what you pay; **bid** is what a sale returns — the UI never mixes them. Probability changes are shown in **pp**, returns in **%**. Components never compute money; they call the engine and selectors.

## Testing done

Run on 11 Oct 2026 in a Linux container with Chromium 1194:

- `npm run lint` — pass
- `npm run typecheck` — pass
- `npm run test` — **45 passed** (35 domain/fixture tests covering FIN-01..21, 3 store/persistence tests incl. FIN-22, 7 UI component tests)
- `npm run build` — pass
- `npm run test:e2e` — **26 passed**: E2E-01..23 and 25..27 on desktop 1440px, E2E-24 + search/filters on mobile 390px, plus liquidity, suspension and settlement scenarios
- `python3 scripts/validate-fixtures.py` — PASS
- Visual QA: screenshots in [`docs/qa/`](docs/qa) compared against the approved references in `references/` (see `docs/DESIGN_REFERENCES.md`).

Not done: no automated axe audit, no manual screen-reader pass, no testing on Safari/Firefox or real phones, no user research. Keyboard flows are covered by E2E-23/26 (search, review, Escape, focus return).

## Differences from the references (deliberate)

- **No Insights tab** and **"Demo funds"** instead of *Deposit* (per the spec); Insights live as notes on Home and in each market's News tab.
- **Placeholder art is generated in code** (SVG scenes per category). No photos, logos or real people are used. Replacing them with licensed or commissioned images is a production task.
- A **fictional candidate (Elena Marlowe)** replaces the real politician used in the original fixture and blueprint examples.
- Market **News** notes were rewritten as richer fictional storyline notes, all signed *NOVA Demo* and marked *Simulated*; any numbers they mention match the fixture charts.
- Home's *Upcoming key events* became **Closing soon** (real links to markets), since "Set reminder" would have been a fake button.
- Counts show the real demo catalogue (24 markets), not the references' invented totals.

## Limitations

Fixed demo clock (10 Oct 2026) and frozen prices; no order book, partial fills or sell limits (P1); limit orders never fill on their own; 24 markets; English UI only; `npm audit` reports an advisory in the dev-only test runner (vitest 4.0.x is pinned because npm 10 fails to install 4.1.x — see `IMPLEMENTATION_PROGRESS.md`).
