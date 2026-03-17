import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'AI Planning Assistant',
        short_name: 'AI Plan',
        description: 'Mon assistant de planification IA',
        theme_color: '#1E88E5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Cela force la mise en cache de tous tes fichiers pour le mode hors-ligne
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  resolve: {
    alias: {
      // C'est ce bloc qui répare l'erreur "@" dans Button, Label, etc.
      "@": path.resolve(__dirname, "./src"),
    },
  },
})