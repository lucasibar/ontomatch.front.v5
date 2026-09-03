import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      workbox: {
        // Cache application assets on use; never cache API responses or personal data.
        globPatterns: ['**/*.{html,css,svg,png,ico}'],
        runtimeCaching: [{
          urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/assets/'),
          handler: 'CacheFirst',
          options: { cacheName: 'ontomatch-static-assets', expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 } },
        }],
      },
      manifest: {
        name: 'OntoMatch - Citas para Coaches',
        short_name: 'OntoMatch',
        description: 'Encuentra a tu partner ideal',
        theme_color: '#FAF9F7',
        background_color: '#FAF9F7',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://ui-avatars.com/api/?name=OM&size=192&background=3A3A3C&color=fff',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://ui-avatars.com/api/?name=OM&size=512&background=3A3A3C&color=fff',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
