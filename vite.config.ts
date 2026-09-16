import { defineConfig, type Plugin } from 'vite'
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

// Social previews need absolute URLs. The Pages workflow passes its own
// base_url; other builds (Vercel, local) fall back to the Vercel deployment.
const siteUrl = (process.env.VITE_SITE_URL?.trim() || 'https://personal-portfolio-anuv2.vercel.app').replace(
  /\/+$/,
  '',
)

const siteUrlPlugin = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
})

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), siteUrlPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
})
