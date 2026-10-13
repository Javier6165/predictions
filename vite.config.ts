/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@data': fileURLToPath(new URL('./data', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      // The single-file preview build inlines everything into one chunk instead.
      output: process.env.VITE_ROUTER === 'memory' ? { inlineDynamicImports: true } : {
        // Keep the app chunk small: vendor libraries change rarely and cache well.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/recharts|d3-|victory|decimal\.js|eventemitter3|lodash/.test(id)) return 'charts';
          if (/radix-ui|@radix-ui|cmdk|@floating-ui|react-remove-scroll|aria-hidden/.test(id)) return 'ui';
          if (/react-dom|react-router|scheduler|\/react\//.test(id)) return 'react';
          return 'vendor';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
