// Motor de animación de figuras "palito".
// Cada pose usa ángulos absolutos en grados: 0 = hacia abajo, 90 = hacia delante
// (derecha), 180 = hacia arriba, -90 = hacia atrás. Así las extremidades
// conservan su longitud al interpolar entre poses.
//
// Pose: { t: torso (cadera→cuello), h?: cabeza, a1/a2: [brazo, antebrazo],
//         l1/l2: [muslo, tibia], f1/f2?: pie, x?: desplazamiento, lift?: salto }
// a1/l1 = extremidades cercanas (más oscuras), a2/l2 = lejanas.

const D = Math.PI / 180;
const L = { torso: 46, neck: 13, head: 9.5, ua: 24, fa: 22, th: 30, sh: 30, foot: 9 };
// Radio (medio grosor) de cada articulación, para apoyar bien en el suelo y encuadrar.
const R = {
  hip: 9, neck: 8, sh1: 5, sh2: 5, hp1: 7, hp2: 7, el1: 4.5, el2: 4.5, ha1: 4.5, ha2: 4.5,
  kn1: 6, kn2: 6, an1: 4.5, an2: 4.5, to1: 4, to2: 4,
};

const vec = (a, len) => [Math.sin(a * D) * len, Math.cos(a * D) * len];
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];

// Completa los valores por defecto para poder interpolar sin huecos.
function normalize(p, front) {
  const n = {
    t: p.t,
    h: p.h ?? p.t,
    a1: p.a1,
    a2: p.a2,
    l1: p.l1,
    l2: p.l2,
    x: p.x ?? 0,
    lift: p.lift ?? 0,
  };
  n.f1 = p.f1 ?? p.l1[1] + 90;
  n.f2 = p.f2 ?? p.l2[1] + (front ? -90 : 90);
  return n;
}

function lerpPose(a, b, k) {
  const out = {};
  for (const key in a) {
    const va = a[key];
    const vb = b[key];
    out[key] = Array.isArray(va) ? va.map((v, i) => v + (vb[i] - v) * k) : va + (vb - va) * k;
  }
  return out;
}

// Calcula articulaciones en coordenadas locales (cadera en 0,0; y hacia abajo).
function joints(p, front, hwOverride) {
  const sw = front ? 11 : 0;
  const hw = front ? hwOverride ?? 7 : 0;
  const hip = [0, 0];
  const neck = add(hip, vec(p.t, L.torso));
  const perp = vec(p.t - 90, 1);
  const off = (pt, d) => [pt[0] + perp[0] * d, pt[1] + perp[1] * d];
  const sh1 = off(neck, sw);
  const sh2 = off(neck, -sw);
  const hp1 = off(hip, hw);
  const hp2 = off(hip, -hw);
  const el1 = add(sh1, vec(p.a1[0], L.ua));
  const ha1 = add(el1, vec(p.a1[1], L.fa));
  const el2 = add(sh2, vec(p.a2[0], L.ua));
  const ha2 = add(el2, vec(p.a2[1], L.fa));
  const kn1 = add(hp1, vec(p.l1[0], L.th));
  const an1 = add(kn1, vec(p.l1[1], L.sh));
  const to1 = add(an1, vec(p.f1, L.foot));
  const kn2 = add(hp2, vec(p.l2[0], L.th));
  const an2 = add(kn2, vec(p.l2[1], L.sh));
  const to2 = add(an2, vec(p.f2, L.foot));
  const head = add(neck, vec(p.h, L.neck));
  return { hip, neck, head, sh1, sh2, hp1, hp2, el1, ha1, el2, ha2, kn1, an1, to1, kn2, an2, to2 };
}

const POINT_KEYS = ['hip', 'neck', 'sh1', 'sh2', 'hp1', 'hp2', 'el1', 'ha1', 'el2', 'ha2', 'kn1', 'an1', 'to1', 'kn2', 'an2', 'to2'];

// Coloca la figura: el punto ancla fijo en x=0 y el punto más bajo tocando el suelo (y=0).
function place(p, anim) {
  const front = anim.view === 'front';
  const j = joints(p, front, anim.hw);
  let ax;
  if (anim.anchor === 'feet') ax = (j.an1[0] + j.an2[0]) / 2;
  else ax = j[anim.anchor || 'an1'][0];
  let maxY = j.head[1] + L.head;
  for (const k of POINT_KEYS) maxY = Math.max(maxY, j[k][1] + R[k]);
  const dx = -ax + p.x;
  const dy = -maxY - p.lift;
  const out = {};
  for (const k in j) out[k] = [j[k][0] + dx, j[k][1] + dy];
  return out;
}

const ease = (k) => 0.5 - Math.cos(k * Math.PI) / 2;

function segDurations(anim) {
  const n = anim.poses.length - 1;
  const ms = anim.ms ?? 900;
  return Array.from({ length: n }, (_, i) => (Array.isArray(ms) ? ms[i] ?? ms[ms.length - 1] : ms));
}

const cache = new WeakMap();

function prepared(anim) {
  let c = cache.get(anim);
  if (c) return c;
  const front = anim.view === 'front';
  const poses = anim.poses.map((p) => normalize(p, front));
  const durs = segDurations(anim);
  const total = durs.reduce((s, d) => s + d, 0);
  // Encuadre: unión de cajas de varias muestras para que no "salte" la cámara.
  let minX = Infinity, maxX = -Infinity, minY = Infinity;
  for (let i = 0; i < poses.length - 1; i++) {
    for (let s = 0; s <= 4; s++) {
      const j = place(lerpPose(poses[i], poses[i + 1], s / 4), anim);
      for (const k of [...POINT_KEYS, 'head']) {
        const r = k === 'head' ? L.head : R[k];
        minX = Math.min(minX, j[k][0] - r);
        maxX = Math.max(maxX, j[k][0] + r);
        minY = Math.min(minY, j[k][1] - r);
      }
    }
  }
  const props = (anim.props || []).map((pr) => {
    const j = place(poses[0], anim);
    const at = j[pr.at] || [0, 0];
    return { ...pr, x: at[0] + (pr.dx || 0), y: at[1] + (pr.dy || 0) };
  });
  for (const pr of props) {
    const w = pr.w || 34;
    minX = Math.min(minX, pr.x - w / 2 - 4);
    maxX = Math.max(maxX, pr.x + w / 2 + 4);
    minY = Math.min(minY, pr.type === 'wall' ? -120 : pr.y);
  }
  const bw = maxX - minX + 24;
  const bh = -minY + 20;
  const W = Math.max(bw, bh * (4 / 3), 140);
  const H = W * 0.75;
  const cx = (minX + maxX) / 2;
  const viewBox = [cx - W / 2, -H + 10, W, H];
  c = { poses, durs, total, viewBox, props, front };
  cache.set(anim, c);
  return c;
}

// Devuelve el fotograma en el instante `ms` (en bucle).
export function frameAt(anim, ms) {
  const c = prepared(anim);
  let t = ((ms % c.total) + c.total) % c.total;
  let i = 0;
  while (i < c.durs.length - 1 && t > c.durs[i]) {
    t -= c.durs[i];
    i++;
  }
  const k = ease(Math.min(1, t / c.durs[i]));
  const pose = lerpPose(c.poses[i], c.poses[i + 1], k);
  return { j: place(pose, anim), viewBox: c.viewBox, props: c.props, front: c.front };
}

// Fotograma estático de la pose `index`.
export function stillFrame(anim, index = 0) {
  const c = prepared(anim);
  const p = c.poses[Math.min(index, c.poses.length - 1)];
  return { j: place(p, anim), viewBox: c.viewBox, props: c.props, front: c.front };
}

export const HEAD_R = L.head;
export const SIZES = L;
