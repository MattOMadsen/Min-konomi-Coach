import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',        // Opdaterer automatisk når du ændrer noget
      manifest: {
        name: 'Økonomi Coach',
        short_name: 'Økonomi Coach',
        description: 'Din personlige AI-økonomicoach',
        theme_color: '#10b981',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'https://via.placeholder.com/192x192/10b981/ffffff?text=💰',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://via.placeholder.com/512x512/10b981/ffffff?text=💰',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})