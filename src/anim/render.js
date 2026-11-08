import { HEAD_R } from './figure.js';

// Render de la figura con volumen: extremidades gruesas, camiseta, pantalón corto,
// zapatillas, pelo, sombra y esterilla. Los colores salen de variables CSS (.fig).

const f = (n) => Math.round(n * 10) / 10;
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const seg = (a, b, cls, w) =>
  `<path class="${cls}" stroke-width="${w}" d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}"/>`;

function propMarkup(pr) {
  if (pr.type === 'bench') {
    const w = pr.w || 34;
    const x0 = pr.x - w / 2;
    const top = pr.y;
    return (
      `<path class="fig-prop-line" d="M${f(x0 + 5)} ${f(top + 4)}L${f(x0 + 5)} 0M${f(x0 + w - 5)} ${f(top + 4)}L${f(x0 + w - 5)} 0"/>` +
      `<rect x="${f(x0)}" y="${f(top)}" width="${w}" height="6" rx="2.5" class="fig-prop"/>`
    );
  }
  if (pr.type === 'wall') {
    return `<rect x="${f(pr.x - 8)}" y="-220" width="8" height="220" class="fig-prop"/>`;
  }
  return '';
}

// Pierna: muslo con pantalón corto, tibia, zapatilla.
function leg(hp, kn, an, to, side) {
  return (
    seg(hp, kn, `fig-skin${side}`, 11) +
    seg(an, to, `fig-shoe${side}`, 8) +
    seg(kn, an, `fig-skin${side}`, 9) +
    seg(hp, lerp(hp, kn, 0.55), `fig-shorts${side}`, 13.5)
  );
}

// Brazo: manga corta, antebrazo, mano.
function arm(sh, el, ha, side) {
  return (
    seg(sh, el, `fig-skin${side}`, 8.5) +
    seg(el, ha, `fig-skin${side}`, 7.5) +
    `<circle class="fig-skin${side}-fill" cx="${f(ha[0])}" cy="${f(ha[1])}" r="4.6"/>` +
    seg(sh, lerp(sh, el, 0.42), `fig-shirt${side}`, 11)
  );
}

function torso(j, front) {
  if (front) {
    const pts = [j.sh1, j.sh2, j.hp2, j.hp1].map((p) => `${f(p[0])} ${f(p[1])}`).join('L');
    const waist1 = lerp(j.hp1, j.sh1, 0.2);
    const waist2 = lerp(j.hp2, j.sh2, 0.2);
    const shorts = [waist1, waist2, j.hp2, j.hp1].map((p) => `${f(p[0])} ${f(p[1])}`).join('L');
    return `<path class="fig-shirt-poly" d="M${pts}Z"/><path class="fig-shorts-poly" d="M${shorts}Z"/>`;
  }
  return seg(j.hip, j.neck, 'fig-shirt', 19) + seg(j.hip, lerp(j.hip, j.neck, 0.22), 'fig-shorts', 19.5);
}

function head(j) {
  const up = [j.head[0] - j.neck[0], j.head[1] - j.neck[1]];
  const len = Math.hypot(up[0], up[1]) || 1;
  const u = [up[0] / len, up[1] / len];
  // "Delante" de la cabeza: perpendicular hacia la dirección de la mirada (derecha si está de pie).
  const fw = [-u[1], u[0]];
  const fwd = fw[0] < 0 || (fw[0] === 0 && fw[1] > 0) ? [-fw[0], -fw[1]] : fw;
  const hair = [j.head[0] - fwd[0] * 1.8 + u[0] * 1.6, j.head[1] - fwd[1] * 1.8 + u[1] * 1.6];
  const face = [j.head[0] + fwd[0] * 0.8, j.head[1] + fwd[1] * 0.8];
  return (
    seg(j.neck, j.head, 'fig-skin', 7) +
    `<circle class="fig-hair" cx="${f(hair[0])}" cy="${f(hair[1])}" r="${HEAD_R}"/>` +
    `<circle class="fig-skin-fill" cx="${f(face[0])}" cy="${f(face[1])}" r="${HEAD_R - 0.6}"/>`
  );
}

// Genera el contenido SVG de un fotograma.
export function svgMarkup({ j, viewBox, props, front }) {
  const [vx, vy, vw, vh] = viewBox;
  const xs = Object.values(j).map((p) => p[0]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const shadow = `<ellipse class="fig-shadow" cx="${f((minX + maxX) / 2)}" cy="1" rx="${f((maxX - minX) / 2 + 10)}" ry="3.5"/>`;
  const mat = `<rect class="fig-mat" x="${f(vx + vw * 0.06)}" y="0" width="${f(vw * 0.88)}" height="4" rx="2"/>`;
  const far = front ? '' : '-far';
  const body = front
    ? leg(j.hp2, j.kn2, j.an2, j.to2, '') + leg(j.hp1, j.kn1, j.an1, j.to1, '') + torso(j, true) +
      arm(j.sh2, j.el2, j.ha2, '') + arm(j.sh1, j.el1, j.ha1, '')
    : leg(j.hp2, j.kn2, j.an2, j.to2, far) + arm(j.sh2, j.el2, j.ha2, far) + torso(j, false) +
      leg(j.hp1, j.kn1, j.an1, j.to1, '') + arm(j.sh1, j.el1, j.ha1, '');
  return {
    viewBox: `${f(vx)} ${f(vy)} ${f(vw)} ${f(vh)}`,
    inner: mat + shadow + props.map(propMarkup).join('') + body + head(j),
  };
}
