// Plan del reto de 28 días.
// Ciclo semanal (todos los días se entrena, alternando intensidad y grupos musculares):
//   1 Cuerpo completo · 2 Cardio y core · 3 Piernas y glúteos · 4 Movilidad (suave)
//   5 Tren superior y core · 6 Circuito · 7 Core y estiramientos (suave)
// Progresión: S1 básico 30/30 ×2 · S2 básico 40/20 ×2 · S3 medio 30/30 ×3 · S4 medio 40/20 ×3
// Ciclo 2 en adelante: medio 45/15 ×3.

import { EXERCISES } from './exercises.js';

const CALENTAMIENTO = ['marcha', 'circulos_brazos', 'rotacion_cadera', 'gato_vaca', 'buenos_dias', 'jumping_jacks'];
const VUELTA_CALMA = ['postura_nino', 'cobra', 'isquios', 'cuadriceps', 'pecho'];

const TIPOS = {
  completo: {
    titulo: 'Cuerpo completo',
    basico: ['sentadilla', 'flexion_inclinada', 'puente_gluteo', 'superman', 'zancada_atras', 'plancha'],
    medio: ['sentadilla', 'flexion', 'puente_una_pierna', 'plancha_inversa', 'plancha_lateral'],
  },
  cardio: {
    titulo: 'Cardio y core',
    basico: ['jumping_jacks', 'dead_bug', 'sentadilla', 'bird_dog', 'marcha', 'plancha'],
    medio: ['burpee', 'escaladores', 'patinador', 'hollow', 'rodillas_altas'],
  },
  piernas: {
    titulo: 'Piernas y glúteos',
    basico: ['sentadilla', 'zancada_atras', 'puente_gluteo', 'elevacion_talones', 'sentadilla_pared', 'buenos_dias'],
    medio: ['sentadilla_bulgara', 'zancada_lateral', 'puente_una_pierna', 'sentadilla_salto', 'elevacion_talones'],
  },
  movilidad: {
    titulo: 'Movilidad activa',
    suave: true,
    basico: ['gato_vaca', 'bird_dog', 'rotacion_cadera', 'buenos_dias', 'puente_gluteo', 'dead_bug', 'circulos_brazos', 'cobra', 'postura_nino', 'isquios'],
    medio: ['gato_vaca', 'bird_dog', 'rotacion_cadera', 'buenos_dias', 'puente_gluteo', 'dead_bug', 'circulos_brazos', 'cobra', 'postura_nino', 'isquios'],
  },
  superior: {
    titulo: 'Tren superior y core',
    basico: ['flexion_inclinada', 'superman', 'flexion_rodillas', 'bird_dog', 'plancha', 'dead_bug'],
    medio: ['flexion', 'nadador', 'flexion_pica', 'fondos_silla', 'plancha_inversa'],
  },
  circuito: {
    titulo: 'Circuito dinámico',
    basico: ['jumping_jacks', 'sentadilla', 'flexion_rodillas', 'zancada_atras', 'puente_gluteo', 'plancha'],
    medio: ['burpee', 'sentadilla_salto', 'flexion', 'zancada_lateral', 'escaladores'],
  },
  core: {
    titulo: 'Core y estiramientos',
    suave: true,
    basico: ['dead_bug', 'bird_dog', 'plancha', 'puente_gluteo'],
    medio: ['hollow', 'plancha_lateral', 'bird_dog', 'toque_hombros'],
  },
};

const SEMANA = ['completo', 'cardio', 'piernas', 'movilidad', 'superior', 'circuito', 'core'];

function carga(semana, ciclo) {
  if (ciclo >= 2) return { nivel: 'medio', trabajo: 45, descanso: 15, rondas: 3 };
  return [
    { nivel: 'básico', trabajo: 30, descanso: 30, rondas: 2 },
    { nivel: 'básico', trabajo: 40, descanso: 20, rondas: 2 },
    { nivel: 'medio', trabajo: 30, descanso: 30, rondas: 3 },
    { nivel: 'medio', trabajo: 40, descanso: 20, rondas: 3 },
  ][semana - 1];
}

// Devuelve el entrenamiento del día (1..28) para un ciclo dado.
export function workoutFor(dia, ciclo = 1) {
  const semana = Math.ceil(dia / 7);
  const tipoId = SEMANA[(dia - 1) % 7];
  const tipo = TIPOS[tipoId];
  const c = carga(semana, ciclo);
  const ejercicios = c.nivel === 'medio' ? tipo.medio : tipo.basico;

  const fases = [];
  if (tipoId === 'movilidad') {
    // Flujo continuo, una sola vuelta, sin calentamiento aparte.
    fases.push({ nombre: 'Movilidad', ejercicios, rondas: 1, trabajo: c.nivel === 'medio' ? 50 : 40, descanso: 10 });
    fases.push({ nombre: 'Vuelta a la calma', ejercicios: ['cuadriceps', 'pecho'], rondas: 1, trabajo: 40, descanso: 0 });
  } else {
    fases.push({ nombre: 'Calentamiento', ejercicios: CALENTAMIENTO, rondas: 1, trabajo: 30, descanso: 0 });
    fases.push({ nombre: 'Circuito', ejercicios, rondas: c.rondas, trabajo: c.trabajo, descanso: c.descanso });
    fases.push({
      nombre: 'Vuelta a la calma',
      ejercicios: VUELTA_CALMA,
      rondas: 1,
      trabajo: tipoId === 'core' ? 45 : 30,
      descanso: 0,
    });
  }

  const segundos = fases.reduce((s, f) => s + f.ejercicios.length * f.rondas * (f.trabajo + f.descanso), 0);
  return {
    dia,
    semana,
    ciclo,
    tipo: tipoId,
    titulo: tipo.titulo,
    suave: !!tipo.suave,
    nivel: c.nivel,
    resumen: tipoId === 'movilidad' ? 'Flujo continuo' : `${c.rondas} rondas · ${c.trabajo}s trabajo / ${c.descanso}s descanso`,
    fases,
    minutos: Math.round(segundos / 60),
    principal: ejercicios[0],
  };
}

export function semanaLabel(semana, ciclo = 1) {
  const c = carga(semana, ciclo);
  return `Semana ${semana} · ${c.nivel === 'medio' ? 'Medio' : 'Básico'}`;
}

// Comprobación rápida: todos los ids existen.
for (const t of Object.values(TIPOS)) {
  for (const id of [...t.basico, ...t.medio]) if (!EXERCISES[id]) throw new Error(`Ejercicio desconocido: ${id}`);
}
