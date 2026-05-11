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
        enabled: true,
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
