import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'icons/icon.svg', 'data/world.json'],
      manifest: {
        name: 'Prague Crew',
        short_name: 'Prague Crew',
        description: 'Live map, timelapse, plan & prep for the Prague trip, 13–22 Nov 2026',
        theme_color: '#16151b',
        background_color: '#f5f2ec',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/#/now',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Map', url: '/#/map' },
          { name: 'Plan', url: '/#/plan' },
          { name: 'Prep', url: '/#/prep' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // vector tiles: cache-first (also pre-filled by "Download offline map")
            urlPattern: ({ url }) => url.hostname === 'tiles.openfreemap.org' && url.pathname.endsWith('.pbf') && !url.pathname.startsWith('/fonts/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'ofm-tiles',
              matchOptions: { ignoreVary: true },
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 12000, maxAgeSeconds: 120 * 24 * 3600 },
            },
          },
          {
            // fonts / sprites: immutable-ish
            urlPattern: ({ url }) => url.hostname === 'tiles.openfreemap.org' && (url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/sprites/')),
            handler: 'CacheFirst',
            options: { cacheName: 'ofm-assets', matchOptions: { ignoreVary: true }, cacheableResponse: { statuses: [200] } },
          },
          {
            // styles + TileJSON: network first, fall back to cache offline
            urlPattern: ({ url }) => url.hostname === 'tiles.openfreemap.org',
            handler: 'NetworkFirst',
            options: { cacheName: 'ofm-assets', networkTimeoutSeconds: 4, matchOptions: { ignoreVary: true }, cacheableResponse: { statuses: [200] } },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'api.open-meteo.com',
            handler: 'NetworkFirst',
            options: { cacheName: 'weather', networkTimeoutSeconds: 5, expiration: { maxEntries: 10 } },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'routing.openstreetmap.de',
            handler: 'NetworkFirst',
            options: { cacheName: 'routes', networkTimeoutSeconds: 8, expiration: { maxEntries: 80 } },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
  server: { host: true },
});
