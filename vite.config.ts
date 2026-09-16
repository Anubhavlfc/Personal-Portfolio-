import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// GitHub Pages serves project sites under /<repo>/. The deploy workflow sets
// VITE_BASE_PATH from actions/configure-pages; everywhere else (local dev,
// Vercel, a username.github.io site) the site lives at the root.
const basePath = process.env.VITE_BASE_PATH?.trim()
const base = basePath ? `${basePath.replace(/\/+$/, '')}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
})
