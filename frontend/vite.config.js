import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/web-project/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
    },
  },
  optimizeDeps: {
    force: true,
  },
})

