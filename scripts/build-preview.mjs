// Single-file preview build: one self-contained HTML (JS, CSS and fonts inlined),
// in-memory routing. Output: dist-preview/nova-preview.html
// Usage: npm run build:preview
import { build } from 'vite';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';

process.env.VITE_ROUTER = 'memory';
const outDir = 'dist-preview';
await build({
  logLevel: 'warn',
  build: {
    outDir,
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
  },
});

const assets = join(outDir, 'assets');
const files = readdirSync(assets);
const js = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
const rawCss = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');

// Hosts inject their own unlayered reset (e.g. `body { color: #000 }`, `a { color: … }`).
// Unlayered CSS beats any @layer, so Tailwind's layered preflight/utilities would lose.
// Unwrap every @layer (keeping source order: theme → base → components → utilities)
// so the app's rules compete on specificity and, coming later, win over the host's.
const flattenLayers = {
  postcssPlugin: 'flatten-layers',
  OnceExit(root) {
    root.walkAtRules('layer', (rule) => {
      if (rule.nodes) rule.replaceWith(rule.nodes);
      else rule.remove();
    });
  },
};
const css = (await postcss([flattenLayers]).process(rawCss, { from: undefined })).css;
if (css.includes('@layer')) throw new Error('flatten-layers: @layer left in preview CSS');
const html = readFileSync(join(outDir, 'index.html'), 'utf8');
const title = /<title>(.*?)<\/title>/s.exec(html)?.[1] ?? 'NOVA';

// Body-only document (hosts such as claude.ai Artifacts add their own skeleton).
const out = `<title>${title}</title>
<meta name="description" content="Interactive demo · Simulated markets. No real money.">
<style>
:root { color-scheme: light; }
html, body { background: #f5f5f7; }
${css}
</style>
<div id="root"></div>
<script type="module">
${js.replace(/<\/script>/g, '<\\/script>')}
</script>
`;
writeFileSync(join(outDir, 'nova-preview.html'), out);
console.log(`dist-preview/nova-preview.html · ${(out.length / 1024 / 1024).toFixed(2)} MB`);
