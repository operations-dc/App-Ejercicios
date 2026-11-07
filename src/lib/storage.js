// Capa de datos. Todo vive en localStorage del dispositivo.
// Aislada aquí para poder migrar a un backend (p. ej. Supabase) sin tocar la UI.

const KEY = 'reto28.v1';

export const OBJETIVOS = {
  forma: 'Estar en forma',
  peso: 'Perder peso',
  fuerza: 'Ganar fuerza',
};

const empty = () => ({
  version: 1,
  perfil: { objetivo: 'forma', pesoKg: null },
  ciclo: 1,
  completados: {}, // { [dia]: { fecha, duracionSeg, sensacion } } del ciclo actual
  historial: [], // [{ fecha, ciclo, dia, duracionSeg, sensacion }]
  pesos: [], // [{ fecha, kg }]
});

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento no disponible: la app sigue funcionando en memoria */
  }
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Días consecutivos con al menos un entrenamiento, terminando hoy o ayer.
export function racha(historial) {
  const dias = new Set(historial.map((h) => h.fecha));
  const d = new Date();
  if (!dias.has(fmt(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dias.has(fmt(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function exportJSON(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `reto28-copia-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importJSON(file) {
  const data = JSON.parse(await file.text());
  if (!data || data.version !== 1 || typeof data.completados !== 'object') throw new Error('Archivo no válido');
  return { ...empty(), ...data };
}
