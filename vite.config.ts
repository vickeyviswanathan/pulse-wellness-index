import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const isGhPages = process.env.GITHUB_PAGES === 'true'
const base = isGhPages ? '/pulse-wellness-index/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/pulse-icon.svg'],
      manifest: {
        name: 'PULSE — Corporate Wellness Index (India)',
        short_name: 'PULSE Index',
        description:
          'India Corporate Wellness Index, Offline Clinician Workshop Portal, and CFO/GMC Actuarial Command Center.',
        theme_color: '#064e3b',
        background_color: '#f8f9fa',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: base,
        scope: base,
        icons: [
          {
            src: `${base}icons/pulse-icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
