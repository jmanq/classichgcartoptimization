import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: 'electron/main.mjs'
    })
  ],
  base: './',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});