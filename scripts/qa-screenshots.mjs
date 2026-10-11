// Visual QA helper: node scripts/qa-screenshots.mjs <baseUrl> <outDir> [path ...]
// Captures desktop (1440) and mobile (390) full-page screenshots of the given routes.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [base = 'http://localhost:5173', out = 'qa-screenshots', ...paths] = process.argv.slice(2);
const routes = paths.length ? paths : ['/', '/explore', '/markets/mars-2035', '/portfolio'];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
for (const [label, viewport, mobile] of [
  ['desktop', { width: 1440, height: 900 }, false],
  ['mobile', { width: 390, height: 844 }, true],
]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const r of routes) {
    await page.goto(base + r, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // let entrance animations finish
    const name = `${label}${r.replace(/[/?=&]+/g, '_') || '_home'}.png`;
    await page.screenshot({ path: join(out, name), fullPage: true });
    console.log('saved', name);
  }
  if (errors.length) console.log(`[${label}] console errors:\n` + errors.join('\n'));
  await ctx.close();
}
await browser.close();
