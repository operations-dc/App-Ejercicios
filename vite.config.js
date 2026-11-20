import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH lo fija el workflow de GitHub Pages (/<repo>/). En local es "/".
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // SW propio (src/sw.js): precache + vídeos con Range requests offline.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        // Incluye fuentes locales, imagen del instructor y los 2 MP4 (1,3 y 1,8 MB).
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,mp4}'],
        // El límite por defecto (2 MiB) es suficiente hoy, pero se fija explícito con margen.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      manifest: {
        name: 'Operación 28 · Calistenia en casa',
        short_name: 'Operación 28',
        description: 'Entrenamientos diarios de calistenia sin material.',
        lang: 'es',
        theme_color: '#1f2418',
        background_color: '#1f2418',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
