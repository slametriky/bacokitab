import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: "0.0.0.0",
    allowedHosts: ["beloved-noticeably-blowfish.ngrok-free.app"],
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: ["beloved-noticeably-blowfish.ngrok-free.app"]
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'menu_book.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'Bacokitab',
        short_name: 'Bacokitab',
        description: 'Bantu bedah tata bahasa Arab',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000 
      }
    })
  ]
})
