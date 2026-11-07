import { HEAD_R } from './figure.js';

const f = (n) => Math.round(n * 10) / 10;
const line = (a, b) => `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
const poly = (...pts) => 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L');

function propMarkup(pr) {
  if (pr.type === 'bench') {
    const w = pr.w || 34;
    const x0 = pr.x - w / 2;
    const top = pr.y;
    return (
      `<rect x="${f(x0)}" y="${f(top)}" width="${w}" height="5" rx="2" class="fig-prop"/>` +
      `<path d="${line([x0 + 4, top + 5], [x0 + 4, 0])}${line([x0 + w - 4, top + 5], [x0 + w - 4, 0])}" class="fig-prop-line"/>`
    );
  }
  if (pr.type === 'wall') {
    return `<rect x="${f(pr.x - 6)}" y="-200" width="6" height="200" class="fig-prop"/>`;
  }
  return '';
}

// Genera el contenido SVG de un fotograma.
export function svgMarkup({ j, viewBox, props, front }) {
  const [vx, vy, vw, vh] = viewBox;
  const far = front ? 'fig-near' : 'fig-far';
  const limbs2 =
    `<path class="${far}" d="${poly(j.sh2, j.el2, j.ha2)}${poly(j.hp2, j.kn2, j.an2, j.to2)}"/>`;
  const body =
    `<path class="fig-near" d="${line(j.hip, j.neck)}${front ? line(j.sh1, j.sh2) + line(j.hp1, j.hp2) : ''}"/>`;
  const limbs1 =
    `<path class="fig-near" d="${poly(j.sh1, j.el1, j.ha1)}${poly(j.hp1, j.kn1, j.an1, j.to1)}"/>`;
  const head = `<circle class="fig-head" cx="${f(j.head[0])}" cy="${f(j.head[1])}" r="${HEAD_R}"/>`;
  const ground = `<path class="fig-ground" d="${line([vx, 0], [vx + vw, 0])}"/>`;
  return {
    viewBox: `${f(vx)} ${f(vy)} ${f(vw)} ${f(vh)}`,
    inner: ground + props.map(propMarkup).join('') + limbs2 + body + limbs1 + head,
  };
}
