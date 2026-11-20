// Demostraciones en vídeo locales (MP4 sin audio). SOLO estos dos ids exactos;
// el resto de ejercicios usa la guía animada SVG existente.
const BASE = import.meta.env.BASE_URL;

export const DEMO_VIDEOS = {
  flexion: `${BASE}media/flexion.mp4`,
  zancada_atras: `${BASE}media/zancada-atras.mp4`,
};

export const hasVideo = (id) => Object.prototype.hasOwnProperty.call(DEMO_VIDEOS, id);
export const INSTRUCTOR_IMG = `${BASE}img/instructor.webp`;
