import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@declit/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
    },
    dedupe: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'zustand'],
  },
  server: { port: 5177, strictPort: true },
  optimizeDeps: { exclude: ['@declit/core'] },
});
