import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.png', 'icons/icon-180.png'],
      manifest: {
        name: 'Estante Encantada',
        short_name: 'Estante',
        description:
          'Histórias infantis narradas, com destaque palavra a palavra, medalhas e sequência de dias de leitura.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FFF7F0',
        theme_color: '#7C5CFC',
        categories: ['education', 'books', 'kids'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // O acervo tem ~60 MB de narração: nada disso entra no pré-cache, senão
        // a instalação do site baixaria tudo de uma vez. Áudio e capa são
        // guardados sob demanda pelas regras abaixo.
        globPatterns: ['**/*.{js,css,html,woff2}'],
        globIgnores: ['**/uploads/**'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Narração: o navegador pede o MP3 em pedaços (range requests),
            // por isso `rangeRequests`.
            urlPattern: /\/uploads\/audio\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'narracao',
              rangeRequests: true,
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200, 206] },
            },
          },
          {
            urlPattern: /\/uploads\/covers\/.*\.(png|jpe?g|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'capas',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    // Permite abrir pelo IP da rede local (celular no mesmo wi-fi).
    host: true,
  },
  build: {
    outDir: 'dist',
    // Os áudios e capas vivem em public/ e são copiados como estão; nada disso
    // entra no bundle JS.
    assetsInlineLimit: 4096,
  },
});
