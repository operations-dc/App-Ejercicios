import { useState } from 'react';
import Figure from '../components/Figure.jsx';
import { Icon } from '../components/ui.jsx';
import { workoutFor, semanaLabel } from '../data/plan.js';
import { OBJETIVOS, racha, today } from '../lib/storage.js';

export default function Home({ state, setState, onOpenDay }) {
  const { completados, ciclo, perfil } = state;
  const hechos = Object.keys(completados).length;
  const siguiente = Array.from({ length: 28 }, (_, i) => i + 1).find((d) => !completados[d]);
  const hoyHecho = state.historial.some((h) => h.fecha === today());
  const r = racha(state.historial);
  const [editPeso, setEditPeso] = useState(false);

  const guardarPeso = (v) => {
    const kg = parseFloat(String(v).replace(',', '.'));
    setEditPeso(false);
    if (!kg || kg < 20 || kg > 300) return;
    setState((s) => ({
      ...s,
      perfil: { ...s.perfil, pesoKg: kg },
      pesos: [...s.pesos.filter((p) => p.fecha !== today()), { fecha: today(), kg }],
    }));
  };

  const nuevoCiclo = () =>
    setState((s) => ({ ...s, ciclo: s.ciclo + 1, completados: {} }));

  return (
    <div className="px-4 pb-6">
      <header className="safe-top pb-4 text-center">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-accent">RETO 28 DÍAS · NIVEL {ciclo}</p>
        <h1 className="mt-1 text-[26px] leading-[1.05] font-black tracking-tight uppercase">
          Calistenia en casa
        </h1>
      </header>

      <section className="rounded-2xl bg-card p-4 ring-1 ring-line">
        <div className="grid grid-cols-2 divide-x divide-line">
          <label className="pr-3">
            <span className="block text-[11px] text-muted">Objetivo</span>
            <select
              className="-ml-1 w-full bg-transparent text-sm font-semibold outline-none"
              value={perfil.objetivo}
              onChange={(e) => setState((s) => ({ ...s, perfil: { ...s.perfil, objetivo: e.target.value } }))}
            >
              {Object.entries(OBJETIVOS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <div className="pl-3">
            <span className="block text-[11px] text-muted">Peso actual</span>
            {editPeso ? (
              <input
                autoFocus
                inputMode="decimal"
                defaultValue={perfil.pesoKg ?? ''}
                className="w-20 border-b border-accent text-sm font-semibold outline-none"
                onBlur={(e) => guardarPeso(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
            ) : (
              <button className="flex items-center gap-1 text-sm font-semibold" onClick={() => setEditPeso(true)}>
                {perfil.pesoKg ? `${perfil.pesoKg} kg` : 'Añadir'}
                <Icon name="edit" className="h-3.5 w-3.5 text-muted" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="block text-[11px] text-muted">Tu progreso</span>
            <span className="text-sm font-semibold">{hechos} de 28 entrenamientos</span>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold" title="Racha de días seguidos">
            <Icon name="flame" className={`h-4 w-4 ${r > 0 ? 'text-accent' : 'text-muted'}`} />
            {r} {r === 1 ? 'día' : 'días'}
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(hechos / 28) * 100}%` }} />
        </div>
      </section>

      {siguiente ? (
        <TodayCard dia={siguiente} ciclo={ciclo} hoyHecho={hoyHecho} onOpen={() => onOpenDay(siguiente)} />
      ) : (
        <section className="mt-4 rounded-2xl bg-ink p-5 text-center text-white">
          <p className="text-lg font-bold">¡Reto completado! 🎉</p>
          <p className="mt-1 text-sm text-white/70">28 de 28. El nivel {ciclo + 1} usa ejercicios de nivel medio con más volumen.</p>
          <button className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-bold" onClick={nuevoCiclo}>
            Empezar nivel {ciclo + 1}
          </button>
        </section>
      )}

      {[1, 2, 3, 4].map((sem) => (
        <section key={sem} className="mt-5">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">{semanaLabel(sem, ciclo)}</h2>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }, (_, i) => (sem - 1) * 7 + i + 1).map((dia) => (
              <DayTile
                key={dia}
                dia={dia}
                ciclo={ciclo}
                estado={completados[dia] ? 'hecho' : dia === siguiente ? 'siguiente' : dia < siguiente ? 'hecho' : 'bloqueado'}
                onClick={() => onOpenDay(dia)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TodayCard({ dia, ciclo, hoyHecho, onOpen }) {
  const w = workoutFor(dia, ciclo);
  return (
    <button onClick={onOpen} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-ink p-3 text-left text-white">
      <div className="h-20 w-24 shrink-0 rounded-xl bg-white/5">
        <Figure exId={w.principal} dark className="h-full w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wider text-accent uppercase">
          {hoyHecho ? 'Hoy ya entrenaste · siguiente' : 'Hoy toca'} · Día {dia}
        </p>
        <p className="truncate text-base font-bold">{w.titulo}</p>
        <p className="text-xs text-white/60">{w.minutos} min · Sin material{w.suave ? ' · Suave' : ''}</p>
      </div>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent">
        <Icon name="play" className="h-4 w-4" />
      </span>
    </button>
  );
}

function DayTile({ dia, ciclo, estado, onClick }) {
  const w = workoutFor(dia, ciclo);
  const bloqueado = estado === 'bloqueado';
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1" aria-label={`Día ${dia}`}>
      <div
        className={`relative aspect-square w-full overflow-hidden rounded-lg ring-1 ${
          estado === 'siguiente' ? 'pulse bg-accent-soft ring-accent' : bloqueado ? 'bg-line/60 ring-line' : 'bg-card ring-line'
        }`}
      >
        {bloqueado ? (
          <span className="absolute inset-0 grid place-items-center text-muted">
            <Icon name="lock" className="h-4 w-4" />
          </span>
        ) : (
          <Figure exId={w.principal} playing={false} className="h-full w-full p-0.5" />
        )}
        {estado === 'hecho' && (
          <span className="absolute right-0.5 bottom-0.5 grid h-4 w-4 place-items-center rounded-full bg-ok text-white">
            <Icon name="check" className="h-3 w-3" />
          </span>
        )}
      </div>
      <span className={`text-[10px] font-medium ${bloqueado ? 'text-muted' : ''}`}>Día {dia}</span>
    </button>
  );
}
