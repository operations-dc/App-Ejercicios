// Service worker propio (injectManifest) para servir los vídeos offline con Range requests.
// Los MP4 se precachean completos (200) en la instalación; Safari/Chrome piden rangos
// (bytes=...), que se responden como 206 a partir de la copia precacheada.
import { cleanupOutdatedCaches, createHandlerBoundToURL, matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { createPartialResponse } from 'workbox-range-requests';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// Ámbito propio (raíz o /App-Ejercicios/): nada fuera de él se intercepta, para no tocar
// recursos de aplicaciones vecinas del mismo origen.
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const inScope = (url) => url.origin === self.location.origin && url.pathname.startsWith(SCOPE_PATH);

// Debe ir ANTES de precacheAndRoute para que la ruta de vídeo tenga prioridad.
registerRoute(
  ({ url }) => inScope(url) && url.pathname.endsWith('.mp4'),
  async ({ request }) => {
    const url = new URL(request.url);
    url.search = '';
    const cached = await matchPrecache(url.href);
    if (!cached) return fetch(request); // sin copia: red (si falla, la UI muestra la guía animada)
    if (request.headers.has('range')) return createPartialResponse(request, cached);
    return cached;
  },
);

precacheAndRoute(self.__WB_MANIFEST);

// Navegación offline: la SPA siempre carga index.html del ámbito (raíz o /App-Ejercicios/).
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { allowlist: [new RegExp(`^${escapeRe(SCOPE_PATH)}`)] }));
