import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import pdfProxyHandler from './api/pdf-proxy.js'

const devPdfProxyPlugin = () => ({
  name: 'dev-pdf-proxy',
  configureServer(server) {
    server.middlewares.use('/api/pdf-proxy', async (req, res) => {
      const urlObj = new URL(req.url, 'http://localhost');
      req.query = Object.fromEntries(urlObj.searchParams.entries());
      const wrappedRes = {
        statusCode: 200,
        setHeader: (k, v) => res.setHeader(k, v),
        status(code) {
          this.statusCode = code;
          res.statusCode = code;
          return this;
        },
        json(obj) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        },
        send(buf) {
          res.end(buf);
        },
        end(data) {
          res.end(data);
        },
      };
      await pdfProxyHandler(req, wrappedRes);
    });
  },
});

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
    devPdfProxyPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'menu_book.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'Bacokitab',
        short_name: 'Bacokitab',
        description: 'Bantu bedah tata bahasa Arab',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192-v2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 tahun
              }
            }
          }
        ]
      }
    })
  ]
})
