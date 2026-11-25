// Demostraciones en vídeo locales (MP4 sin audio) y su póster (fotograma del mismo vídeo).
// Piloto limitado: SOLO estos cuatro ids exactos. Plancha queda pendiente (sin vídeo válido).
// El resto de ejercicios usa la guía animada SVG existente.
const BASE = import.meta.env.BASE_URL;

export const DEMO_VIDEOS = Object.freeze({
  flexion: `${BASE}media/flexion.mp4`,
  zancada_atras: `${BASE}media/zancada-atras.mp4`,
  marcha: `${BASE}media/marcha.mp4`,
  sentadilla: `${BASE}media/sentadilla.mp4`,
});

export const DEMO_POSTERS = Object.freeze({
  flexion: `${BASE}media/posters/flexion.webp`,
  zancada_atras: `${BASE}media/posters/zancada_atras.webp`,
  marcha: `${BASE}media/posters/marcha.webp`,
  sentadilla: `${BASE}media/posters/sentadilla.webp`,
});

export const hasVideo = (id) => Object.prototype.hasOwnProperty.call(DEMO_VIDEOS, id);
export const posterFor = (id) => (Object.prototype.hasOwnProperty.call(DEMO_POSTERS, id) ? DEMO_POSTERS[id] : null);
export const VIDEO_COUNT = Object.keys(DEMO_VIDEOS).length;
export const INSTRUCTOR_IMG = `${BASE}img/instructor.webp`;
