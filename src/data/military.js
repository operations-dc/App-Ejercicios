// Ambientación "Operación 28": solo nombres de presentación sobre los datos reales.
// No cambia planes, ids ni tiempos.

export const FASES = ['Instrucción básica', 'Endurecimiento', 'Combate', 'Élite'];
export const faseLabel = (semana) => `Fase ${semana} · ${FASES[semana - 1]}`;

export const CODIGOS = {
  completo: 'Asalto total',
  cardio: 'Marcha forzada',
  piernas: 'Tren de aterrizaje',
  movilidad: 'Mantenimiento de equipo',
  superior: 'Carga de mochila',
  circuito: 'Pista de obstáculos',
  core: 'Núcleo de acero',
};
export const codigo = (w) => CODIGOS[w.tipo] || w.titulo;

// Rango según misiones completadas en total (historial real).
const RANGOS = [
  [28, 'Comandante'], [25, 'Capitán'], [21, 'Teniente'], [18, 'Sargento primero'], [14, 'Sargento'],
  [10, 'Cabo primero'], [7, 'Cabo'], [3, 'Soldado'], [0, 'Recluta'],
];
export function rango(total) {
  const i = RANGOS.findIndex(([min]) => total >= min);
  const [, nombre] = RANGOS[i];
  const sig = RANGOS[i - 1];
  return { nombre, nivel: RANGOS.length - 1 - i, siguiente: sig ? { nombre: sig[1], faltan: sig[0] - total } : null };
}
