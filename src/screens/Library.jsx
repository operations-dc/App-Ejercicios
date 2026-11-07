import { useState } from 'react';
import Figure from '../components/Figure.jsx';
import { Chip, Sheet } from '../components/ui.jsx';
import { EXERCISES, PATRONES } from '../data/exercises.js';

export default function Library() {
  const [sel, setSel] = useState(null);
  const grupos = Object.keys(PATRONES).map((p) => [p, Object.entries(EXERCISES).filter(([, e]) => e.patron === p)]);
  return (
    <div className="safe-top px-4 pb-6">
      <h1 className="pb-1 text-2xl font-black">Ejercicios</h1>
      <p className="text-sm text-muted">{Object.keys(EXERCISES).length} ejercicios sin material. Toca uno para ver la técnica.</p>
      {grupos.map(([p, list]) => (
        <section key={p} className="mt-5">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{PATRONES[p]}</h2>
          <div className="grid grid-cols-2 gap-2">
            {list.map(([id, e]) => (
              <button key={id} onClick={() => setSel(id)} className="rounded-xl bg-card p-2 text-left ring-1 ring-line">
                <Figure exId={id} playing={false} className="h-20 w-full" />
                <p className="mt-1 text-sm leading-tight font-semibold">{e.nombre}</p>
                <p className="text-[11px] text-muted capitalize">{e.nivel}</p>
              </button>
            ))}
          </div>
        </section>
      ))}
      {sel && <ExerciseSheet id={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function ExerciseSheet({ id, onClose }) {
  const e = EXERCISES[id];
  return (
    <Sheet onClose={onClose}>
      <div className="rounded-2xl bg-paper">
        <Figure exId={id} className="mx-auto h-48 w-full max-w-xs" />
      </div>
      <h2 className="mt-3 text-xl font-bold">{e.nombre}</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip>Nivel {e.nivel}</Chip>
        <Chip>{e.musculos}</Chip>
        {e.lados && <Chip>Ambos lados</Chip>}
      </div>
      <h3 className="mt-4 text-sm font-semibold">Técnica</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {e.tips.map((t) => <li key={t}>{t}</li>)}
      </ul>
      {e.facil && (
        <p className="mt-3 rounded-xl bg-accent-soft p-3 text-sm">
          <b>Versión más fácil:</b> {e.facil}
        </p>
      )}
      <button onClick={onClose} className="mt-5 mb-2 w-full rounded-full bg-ink py-3 font-bold text-white">Cerrar</button>
    </Sheet>
  );
}
