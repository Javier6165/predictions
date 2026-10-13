// Single-file preview build: one self-contained HTML (JS, CSS and fonts inlined),
// in-memory routing. Output: dist-preview/nova-preview.html
// Usage: npm run build:preview
import { build } from 'vite';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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
const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
const html = readFileSync(join(outDir, 'index.html'), 'utf8');
const title = /<title>(.*?)<\/title>/s.exec(html)?.[1] ?? 'NOVA';

// Body-only document (hosts such as claude.ai Artifacts add their own skeleton).
const out = `<title>${title}</title>
<meta name="description" content="Interactive demo · Simulated markets. No real money.">
<style>
:root { color-scheme: dark; }
html, body { background: #050912; }
${css}
</style>
<div id="root"></div>
<script type="module">
${js.replace(/<\/script>/g, '<\\/script>')}
</script>
`;
writeFileSync(join(outDir, 'nova-preview.html'), out);
console.log(`dist-preview/nova-preview.html · ${(out.length / 1024 / 1024).toFixed(2)} MB`);
