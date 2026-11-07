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
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Reto 28 días · Calistenia en casa',
        short_name: 'Reto 28',
        description: 'Entrenamientos diarios de calistenia sin material.',
        lang: 'es',
        theme_color: '#fafaf9',
        background_color: '#fafaf9',
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
