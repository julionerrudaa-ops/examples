import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/capture': 'http://localhost:3001',
      '/status': 'http://localhost:3001',
      '/x7k9p2': 'http://localhost:3001',
    },
  },
})
