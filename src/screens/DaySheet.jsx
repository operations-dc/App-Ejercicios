import Figure from '../components/Figure.jsx';
import { Chip, Sheet } from '../components/ui.jsx';
import { EXERCISES } from '../data/exercises.js';
import { workoutFor } from '../data/plan.js';

export default function DaySheet({ dia, ciclo, hecho, onClose, onStart }) {
  const w = workoutFor(dia, ciclo);
  return (
    <Sheet onClose={onClose}>
      <div className="rounded-2xl bg-paper">
        <Figure exId={w.principal} className="mx-auto h-44 w-full max-w-xs" />
      </div>
      <p className="mt-3 text-xs font-semibold tracking-wider text-accent uppercase">Día {dia} · Semana {w.semana}</p>
      <h2 className="text-xl font-bold">{w.titulo}</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip>{w.minutos} min</Chip>
        <Chip>Sin material</Chip>
        <Chip>Nivel {w.nivel}</Chip>
        {w.suave && <Chip>Día suave</Chip>}
      </div>

      {w.fases.map((f) => (
        <div key={f.nombre} className="mt-4">
          <h3 className="text-sm font-semibold">
            {f.nombre}
            <span className="ml-2 font-normal text-muted">
              {f.rondas > 1 ? `${f.rondas} rondas · ` : ''}
              {f.trabajo}s{f.descanso ? ` / ${f.descanso}s descanso` : ' cada uno'}
            </span>
          </h3>
          <ul className="mt-1 divide-y divide-line">
            {f.ejercicios.map((id, i) => (
              <li key={id + i} className="flex items-center gap-3 py-1.5">
                <Figure exId={id} playing={false} className="h-10 w-12 shrink-0 rounded-md bg-paper" />
                <span className="text-sm">{EXERCISES[id].nombre}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button onClick={() => onStart(w)} className="sticky bottom-0 mt-5 mb-2 w-full rounded-full bg-accent py-3.5 text-base font-bold text-white shadow-lg">
        {hecho ? 'Repetir entrenamiento' : 'Empezar entrenamiento'}
      </button>
    </Sheet>
  );
}
