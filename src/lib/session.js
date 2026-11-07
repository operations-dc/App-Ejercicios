// Convierte un entrenamiento en una secuencia lineal de pasos con temporizador.
export function buildSteps(workout) {
  const steps = [{ kind: 'prep', secs: 8, exId: workout.fases[0].ejercicios[0], fase: 'Prepárate' }];
  for (const fase of workout.fases) {
    for (let r = 1; r <= fase.rondas; r++) {
      fase.ejercicios.forEach((exId, i) => {
        steps.push({ kind: 'work', secs: fase.trabajo, exId, fase: fase.nombre, ronda: r, rondas: fase.rondas });
        const last = r === fase.rondas && i === fase.ejercicios.length - 1;
        if (fase.descanso > 0 && !last) {
          const next = fase.ejercicios[(i + 1) % fase.ejercicios.length];
          steps.push({ kind: 'rest', secs: fase.descanso, exId: next, fase: fase.nombre, ronda: r, rondas: fase.rondas });
        }
      });
    }
  }
  // Paso de transición de 5 s entre fases para colocarse.
  const out = [];
  steps.forEach((s, i) => {
    const prev = steps[i - 1];
    if (prev && prev.kind !== 'prep' && s.kind === 'work' && prev.fase !== s.fase) {
      out.push({ kind: 'rest', secs: 8, exId: s.exId, fase: s.fase, ronda: 1, rondas: s.rondas });
    }
    out.push(s);
  });
  return out;
}

export const totalSecs = (steps) => steps.reduce((s, x) => s + x.secs, 0);
