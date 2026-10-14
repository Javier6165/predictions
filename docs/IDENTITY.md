# Likely — identity v3: "If Apple made a prediction market"

## How we got here
- **v1** followed generic dark-dashboard references. It was correct but looked like every prediction market.
- **v2** went editorial: serif type, a lime highlighter, cobalt and vermilion. It gained personality, but read as a magazine or a trendy fintech. It had four loud colours, and the two-colour dot grid vibrated.
- **v3** keeps v2's product ideas and gives them a calm, Apple-grade execution.

## What stays from v2 (it works)
1. **Odds you can count.** Probability is shown as 100 dots ("48 in 100"), filled column by column so the grid is also a split bar. See `DotField`, `YesNoDots`, `OddsBar` and `InHundred` in `src/components/markets/Odds.tsx`.
2. **The ticket is a sentence.** *I believe* [Yes/No] · *and I'm putting in* [$50] · *If I'm right, I get* **$102**. A stake-vs-profit bar sits underneath, and contracts × price are shown as detail.
3. Low density, photos as framed tiles, light/dark/hybrid tokens, AA contrast.

## What changed in v3
- **Type:** SF Pro on Apple devices, falling back to Inter elsewhere. Headlines are semibold with tight tracking. Section titles are two-tone, in Apple's style ("Trending. *What people are weighing right now.*"), and headings use balanced wrapping.
- **Colour:** neutrals do the work: #f5f5f7 page, white tiles, #1d1d1f type. Blue means act or Yes (#0071e3 fills, #005ec2 text). Orange means No. Nothing else is coloured.
- **Dots light up the side you're on.** The grid is neutral grey, and only the side in focus takes colour. Switching the ticket to No lights the No dots in orange, and the headline number follows ("52 in 100 — chance it doesn't").
- **Surfaces:** borderless 28px tiles; translucent material for the nav and the mobile tab bar; white sheets and dialogs over a soft veil; segmented controls for tabs.
- **Layout:**
  - Home: a product-page hero (centred question, pill CTAs, wide photo with the odds on it), bento tiles, a store-style category strip, the week's moves as a grouped list, and notes as tiles.
  - Explore: grouped lists in the style of iOS Settings.
  - Portfolio: summary tiles.
- **Brand:** the wordmark is "Likely" in semibold sans. The mark is nine dots with six filled ("6 of 9"), a probability you can count at glyph size. The favicon is the mark in white on a #1d1d1f rounded square.
- **Labels:** small labels are sentence-case `.eyebrow`. There are no tracked uppercase labels.

## Tokens and themes
- Components use semantic tokens only: `bg`, `surface*`, `line*`, `ink`, `ink-2`, `muted`, `cta`/`on-cta`, `yes`/`no` (text), `yes-fill`/`no-fill`/`rest` (marks only), `series-1…5`.
- Light is the default. `data-theme="dark"` on `<html>` makes the whole app dark; on a single element it makes only that subtree dark (photo tiles). The preference (light / dark / system) is stored with the session, applied before first paint, and set from the navbar toggle or Settings › Appearance.
- Contrast: axe AA in e2e for both themes (`e2e/smoke-a11y.spec.ts`).
- The brand name lives in `src/brand/index.tsx`.
