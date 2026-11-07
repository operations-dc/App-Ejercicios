// Genera una galería HTML con las poses de cada ejercicio (para revisar animaciones).
import { writeFileSync } from 'node:fs';
import { EXERCISES } from '../src/data/exercises.js';
import { stillFrame } from '../src/anim/figure.js';
import { svgMarkup } from '../src/anim/render.js';

const out = process.argv[2] || 'gallery.html';
const ids = process.argv[3] ? process.argv[3].split(',') : Object.keys(EXERCISES);
let html = `<html><head><style>
body{font-family:sans-serif;margin:8px;background:#fff}
.row{display:flex;gap:6px;align-items:center;margin-bottom:6px}
.row b{width:150px;font-size:12px}
svg{width:200px;height:150px;border:1px solid #ddd}
.fig-near{stroke:#222;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;fill:none}
.fig-far{stroke:#999;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;fill:none}
.fig-head{fill:#222}.fig-ground{stroke:#ccc;stroke-width:2}
.fig-prop{fill:#c9a27a}.fig-prop-line{stroke:#c9a27a;stroke-width:4}
</style></head><body>`;
for (const id of ids) {
  const ex = EXERCISES[id];
  html += `<div class="row"><b>${id}</b>`;
  ex.anim.poses.forEach((_, i) => {
    if (i === ex.anim.poses.length - 1 && ex.anim.poses.length > 2) return;
    const m = svgMarkup(stillFrame(ex.anim, i));
    html += `<svg viewBox="${m.viewBox}">${m.inner}</svg>`;
  });
  html += `</div>`;
}
writeFileSync(out, html + '</body></html>');
