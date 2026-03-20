import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/**
 * Base URL configuration — controls where the app expects its assets to be served from.
 * Set via the BASE_URL environment variable. Defaults to '/' (root).
 *
 * Deployment scenarios:
 *
 *   1. Local development (npm run dev)
 *      → BASE_URL not set → defaults to '/'
 *      → App runs at http://localhost:5173/
 *
 *   2. Docker (docker compose up)
 *      → BASE_URL not set → defaults to '/'
 *      → App runs at http://localhost:8080/
 *
 *   3. GitHub Pages WITH custom domain (e.g. wifi-access-cards.app.bauer-group.com)
 *      → BASE_URL not set → defaults to '/'
 *      → Custom domain serves from root, no subpath needed
 *
 *   4. GitHub Pages WITHOUT custom domain (e.g. bauer-group.github.io/COM-WiFiAccessCardGenerator/)
 *      → Set BASE_URL='/COM-WiFiAccessCardGenerator/' in the workflow env
 *      → Assets are served from the repo subpath
 *
 * To switch to scenario 4, add to the workflow build step:
 *   env:
 *     BASE_URL: '/COM-WiFiAccessCardGenerator/'
 */
const base = process.env.BASE_URL || '/';

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_NAME__: JSON.stringify(pkg.name),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{js,css,html,ico,png,svg,woff,woff2}', 'locales/**/*.json'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /\/locales\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'translations',
              expiration: { maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: 'WiFi Access Card Generator | BAUER GROUP',
        short_name: 'WiFi Gen',
        description: 'Generate WiFi access cards with QR codes for easy network access',
        theme_color: '#FF8500',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: base,
        scope: base,
        categories: ['utilities', 'productivity'],
        icons: [
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          qrcode: ['qrcode.react'],
          db: ['dexie', 'dexie-react-hooks'],
        },
      },
    },
  },
});
