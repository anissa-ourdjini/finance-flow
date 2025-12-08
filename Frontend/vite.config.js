import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Serve the app from the repository root so the root `index.html` is used.
  // `publicDir` points to the existing Frontend/public folder so static assets remain available.
  root: '..',
  publicDir: 'Frontend/public',
  server: {
    // proxy /Backend requests to the PHP backend running on localhost:8000
    proxy: {
      '^/Backend': {
        // proxy to WAMP Apache site where you placed the project (e.g. http://localhost/FinanceFlow)
        target: 'http://localhost/FinanceFlow',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // keep path as-is
      }
    }
  },
  plugins: [react()],
})
