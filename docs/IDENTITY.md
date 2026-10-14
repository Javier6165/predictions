# Likely — identity v2

The first build followed the generic dark-dashboard references and ended up looking like every prediction market. Identity v2 changes the look: more editorial, more minimal and more human. The product logic stays the same: engine, quotes, ledger and copy generators are unchanged.

## Principles
1. **Odds you can count.** Probability is shown as 100 dots ("48 in 100"), filled column by column so the grid also reads as a split bar. People read natural frequencies more easily than percentages. `DotField`, `YesNoDots`, `OddsBar` and `InHundred` live in `src/components/markets/Odds.tsx`.
2. **The ticket is a sentence.** *I believe* [Yes/No] · *and I'm putting in* [$50] · *If I'm right, I get* **$102**, with a stake-vs-profit bar. The contract math (contracts × price) sits underneath as detail.
3. **Editorial, not terminal.** Questions are set in a display serif (Instrument Serif). Headers use rules and small-caps kickers. Home reads like a cover: one big question, a few story cards, the week's shifts and short notes. There are no per-row mini charts and no widget walls.
4. **One loud gesture.** A lime "highlighter" (`.mark`, `--color-highlight`) and the DEMO tag. CTAs are ink black, not glowing blue.

## Tokens and themes
- Components use semantic tokens only: `bg`, `surface*`, `line*`, `ink`, `ink-2`, `muted`, `subtle`, `cta`/`on-cta`, `yes`/`no` (text), `yes-fill`/`no-fill` (marks only), `series-1…5`, `highlight`.
- **Paper** (light) is the default. **Night** is `data-theme="dark"`. On `<html>` it themes the whole app; on any element it themes only that subtree. That is how photo frames stay dark inside the light theme (the hybrid mode).
- The theme preference (`light` / `dark` / `system`) is stored with the session. It is applied before first paint by an inline script in `index.html`, and can be changed from the navbar toggle or Settings › Appearance.
- Yes/No are cobalt and vermilion, not stock-market green and red. They stay distinguishable for common colour-vision deficiencies, and direction is always also shown by sign or icon.
- Contrast: AA is checked by axe in e2e for both themes (`e2e/smoke-a11y.spec.ts`).

## Brand
- The name and strings live in `src/brand/index.tsx` (`BRAND`). Renaming the product is a one-line change.
- The mark is a disc of dots, mostly filled in: the signature visual in miniature. It uses `currentColor`. The favicon is the mark on lime.
