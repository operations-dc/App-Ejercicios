// Nombres en inglés SOLO para la voz (la interfaz sigue en español).
// Un nombre por cada id de src/data/exercises.js (38). No cambia ids ni planes.
import { EXERCISES } from './exercises.js';

export const SPEECH_EN = {
  marcha: 'March in place',
  circulos_brazos: 'Arm circles',
  rotacion_cadera: 'Hip circles',
  gato_vaca: 'Cat cow',
  buenos_dias: 'Good mornings',
  jumping_jacks: 'Jumping jacks',
  flexion_inclinada: 'Incline push-up',
  flexion_rodillas: 'Knee push-up',
  flexion: 'Push-up',
  flexion_pica: 'Pike push-up',
  fondos_silla: 'Chair dips',
  superman: 'Superman',
  nadador: 'Swimmers',
  plancha_inversa: 'Reverse plank',
  sentadilla: 'Squat',
  sentadilla_pared: 'Wall sit',
  sentadilla_salto: 'Jump squat',
  sentadilla_bulgara: 'Bulgarian split squat',
  zancada_atras: 'Reverse lunge',
  zancada_lateral: 'Side lunge',
  elevacion_talones: 'Calf raises',
  puente_gluteo: 'Glute bridge',
  puente_una_pierna: 'Single-leg glute bridge',
  plancha: 'Plank',
  plancha_lateral: 'Side plank',
  dead_bug: 'Dead bug',
  bird_dog: 'Bird dog',
  escaladores: 'Mountain climbers',
  hollow: 'Hollow hold',
  toque_hombros: 'Plank shoulder taps',
  rodillas_altas: 'High knees',
  burpee: 'Burpee',
  patinador: 'Skater jumps',
  postura_nino: "Child's pose",
  cobra: 'Cobra stretch',
  isquios: 'Hamstring stretch',
  cuadriceps: 'Quad stretch',
  pecho: 'Chest stretch',
};

// Nunca devuelve el nombre español: si faltara un id, usa un genérico en inglés.
export const speechName = (id) => SPEECH_EN[id] || 'Next exercise';

// Frases habladas (inglés, tono de instructor exigente sin insultos).
export const LINES = {
  prep: (id) => `Get ready. First up: ${speechName(id)}.`,
  rest: (id) => `Rest. Breathe. Next: ${speechName(id)}.`,
  work: (id, secs) => `${speechName(id)}. ${secs} seconds. Go!`,
  side: () => 'Switch sides. Now!',
  done: () => 'Mission complete, soldier. Outstanding work.',
};

// Comprobación en desarrollo/build: todos los ids tienen traducción.
for (const id of Object.keys(EXERCISES)) if (!SPEECH_EN[id]) throw new Error(`Falta nombre en inglés para la voz: ${id}`);
