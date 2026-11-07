// Genera public/favicon.svg y los PNG del icono (usa Playwright para rasterizar).
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { EXERCISES } from '../src/data/exercises.js';
import { stillFrame } from '../src/anim/figure.js';
import { svgMarkup } from '../src/anim/render.js';

const m = svgMarkup(stillFrame(EXERCISES.sentadilla.anim, 1));
const [vx, vy, vw, vh] = m.viewBox.split(' ').map(Number);
const s = 340 / vw; // escala de la figura dentro del icono 512
const inner = m.inner.replace(/<path class="fig-ground"[^>]*\/>/, '');
const svg = (size, pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
<style>.fig-near,.fig-far{fill:none;stroke:#fff;stroke-width:8;stroke-linecap:round;stroke-linejoin:round}.fig-far{stroke:#fcd9cc}.fig-head{fill:#fff}</style>
<rect width="512" height="512" rx="${pad ? 0 : 112}" fill="#e4572e"/>
<g transform="translate(${256 - (vx + vw / 2) * s} ${400 - 0 * s}) scale(${s})">${inner}</g>
<text x="256" y="470" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="64" fill="#fff" text-anchor="middle">28</text>
</svg>`;
writeFileSync('public/favicon.svg', svg(512, false));
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.NODE_PATH + '/playwright');
const b = await chromium.launch();
for (const [name, size, full] of [['icon-192.png', 192, true], ['icon-512.png', 512, true], ['apple-touch-icon.png', 180, true]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<body style="margin:0">${svg(size, full)}</body>`);
  await p.screenshot({ path: 'public/' + name });
  await p.close();
}
await b.close();
