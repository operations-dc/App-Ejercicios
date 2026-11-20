import { useState } from 'react';
import Figure from '../components/Figure.jsx';
import ExerciseDemo from '../components/ExerciseDemo.jsx';
import { Chip, Sheet } from '../components/ui.jsx';
import { EXERCISES, PATRONES } from '../data/exercises.js';
import { hasVideo } from '../data/media.js';

// Manual de campo: los 38 ejercicios reales. Vídeo solo donde existe; el resto, guía animada.
export default function Library() {
  const [sel, setSel] = useState(null);
  const grupos = Object.keys(PATRONES).map((p) => [p, Object.entries(EXERCISES).filter(([, e]) => e.patron === p)]);
  return (
    <div className="safe-top px-4 pb-6">
      <span className="tape">Manual de campo</span>
      <h1 className="stencil mt-2 text-[32px] leading-none">Ejercicios</h1>
      <p className="mt-1 text-base text-sand-300">{Object.keys(EXERCISES).length} ejercicios sin material. Toca uno para ver la técnica.</p>
      {grupos.map(([p, list]) => (
        <section key={p} className="mt-5">
          <h2 className="mb-2 border-b border-olive-500/60 pb-1 text-[15px] font-bold tracking-wider text-sand-200 uppercase">{PATRONES[p]}</h2>
          <div className="grid grid-cols-2 gap-2">
            {list.map(([id, e]) => (
              <button key={id} onClick={() => setSel(id)} className="relative rounded-md bg-olive-800 p-2 text-left ring-1 ring-olive-500" data-ex={id}>
                <Figure exId={id} playing={false} dark className="h-20 w-full" />
                {hasVideo(id) && <span className="tape absolute top-1.5 right-1.5 !text-[11px]">Vídeo</span>}
                <p className="mt-1 text-base leading-tight font-bold text-sand-100">{e.nombre}</p>
                <p className="text-[13px] font-semibold text-sand-300 capitalize">{e.nivel}</p>
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
    <Sheet onClose={onClose} label={e.nombre}>
      <div className="rounded-md bg-olive-900 ring-1 ring-olive-700">
        <ExerciseDemo exId={id} dark playing className="mx-auto h-56 w-full max-w-xs" />
      </div>
      <h2 className="stencil mt-3 text-2xl leading-tight">{e.nombre}</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip>Nivel {e.nivel}</Chip>
        <Chip>{e.musculos}</Chip>
        {e.lados && <Chip>Ambos lados</Chip>}
      </div>
      <h3 className="mt-4 border-b border-olive-500 text-lg font-bold uppercase">Técnica</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-base">
        {e.tips.map((t) => <li key={t}>{t}</li>)}
      </ul>
      {e.facil && (
        <p className="mt-3 rounded-sm border-l-[3px] border-brass bg-olive-900 p-3 text-base">
          <b>Versión más fácil:</b> {e.facil}
        </p>
      )}
      <button onClick={onClose} className="mt-5 mb-2 min-h-12 w-full rounded-sm bg-olive-900 py-3 text-base font-bold tracking-wider text-sand-100 uppercase">Cerrar</button>
    </Sheet>
  );
}
