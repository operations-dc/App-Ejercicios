import { useEffect, useMemo, useRef, useState } from 'react';
import Figure from '../components/Figure.jsx';
import { Icon } from '../components/ui.jsx';
import { EXERCISES } from '../data/exercises.js';
import { buildSteps, totalSecs } from '../lib/session.js';
import { beep, keepAwake, say, unlockAudio, vibrate } from '../lib/audio.js';

export default function Session({ workout, onExit, onFinish }) {
  const steps = useMemo(() => buildSteps(workout), [workout]);
  const total = useMemo(() => totalSecs(steps), [steps]);
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(steps[0].secs);
  const [paused, setPaused] = useState(false);
  const [voz, setVoz] = useState(true);
  const startedAt = useRef(Date.now());
  const lastTick = useRef(null);
  const step = steps[idx];
  const ex = EXERCISES[step.exId];

  // Anuncio al empezar cada paso.
  useEffect(() => {
    setLeft(step.secs);
    const e = EXERCISES[step.exId];
    if (step.kind === 'prep') say(`Prepárate. Empezamos con ${e.nombre}`, voz);
    else if (step.kind === 'rest') say(`Descanso. Siguiente: ${e.nombre}`, voz);
    else {
      say(`${e.nombre}. ${step.secs} segundos`, voz);
      vibrate(200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => {
    unlockAudio();
    keepAwake(true);
    const onVis = () => document.visibilityState === 'visible' && keepAwake(true);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      keepAwake(false);
      document.removeEventListener('visibilitychange', onVis);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Temporizador basado en reloj real (no se desfasa si el navegador ralentiza el intervalo).
  useEffect(() => {
    if (paused) return;
    lastTick.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      setLeft((l) => {
        const nl = l - dt;
        const s = steps[idx];
        // Pitidos 3-2-1 y cambio de lado a mitad.
        for (const mark of [3, 2, 1]) if (l > mark && nl <= mark) beep(mark === 1 ? 660 : 520);
        if (s.kind === 'work' && EXERCISES[s.exId].lados && l > s.secs / 2 && nl <= s.secs / 2) {
          say('Cambia de lado', voz);
          vibrate([100, 80, 100]);
        }
        return nl;
      });
    }, 100);
    return () => clearInterval(id);
  }, [paused, idx, steps, voz]);

  useEffect(() => {
    if (left > 0) return;
    if (idx < steps.length - 1) {
      beep(990, 0.2);
      setIdx((i) => i + 1);
    } else {
      beep(990, 0.4);
      say('¡Entrenamiento completado! Buen trabajo.', voz);
      onFinish(Math.round((Date.now() - startedAt.current) / 1000));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const elapsed = steps.slice(0, idx).reduce((s, x) => s + x.secs, 0) + (step.secs - Math.max(0, left));
  const go = (d) => setIdx((i) => Math.min(steps.length - 1, Math.max(0, i + d)));
  const salir = () => {
    if (confirm('¿Salir del entrenamiento? No se guardará el progreso de hoy.')) onExit();
  };
  const secs = Math.max(0, Math.ceil(left));
  const ring = 2 * Math.PI * 54;
  const isRest = step.kind !== 'work';

  return (
    <div className={`safe-top safe-bottom fixed inset-0 z-50 flex flex-col text-white ${isRest ? 'bg-stone-800' : 'bg-stone-950'}`}>
      <div className="flex items-center gap-3 px-4">
        <button onClick={salir} className="grid h-9 w-9 place-items-center rounded-full bg-white/10" aria-label="Salir">
          <Icon name="close" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">
            {step.fase}
            {step.rondas > 1 ? ` · Ronda ${step.ronda}/${step.rondas}` : ''}
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(elapsed / total) * 100}%` }} />
          </div>
        </div>
        <button onClick={() => setVoz((v) => !v)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10" aria-label="Voz">
          <Icon name={voz ? 'sound' : 'mute'} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <p className={`text-xs font-bold tracking-[0.2em] uppercase ${isRest ? 'text-accent' : 'text-white/50'}`}>
          {step.kind === 'prep' ? 'Prepárate' : step.kind === 'rest' ? 'Descanso · Siguiente' : 'Ahora'}
        </p>
        <h2 className="mt-1 text-center text-2xl font-black">{ex.nombre}</h2>
        <Figure exId={step.exId} dark playing={!paused} className={`mt-2 w-full max-w-sm ${isRest ? 'h-[28vh] opacity-70' : 'h-[34vh]'}`} />

        <div className="relative mt-2 h-32 w-32">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgb(255 255 255 / .12)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none" stroke={isRest ? '#a8a29e' : '#e4572e'} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={ring} strokeDashoffset={ring * (1 - Math.max(0, left) / step.secs)}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-4xl font-black tabular-nums">{secs}</span>
        </div>

        <ul className="mt-3 max-w-sm space-y-1 text-center text-sm text-white/70">
          {ex.tips.slice(0, 2).map((t) => <li key={t}>{t}</li>)}
        </ul>
        {ex.facil && !isRest && <p className="mt-2 max-w-sm text-center text-xs text-white/40">Más fácil: {ex.facil}</p>}
      </div>

      <div className="flex items-center justify-center gap-6 pb-2">
        <button onClick={() => go(-1)} className="grid h-12 w-12 place-items-center rounded-full bg-white/10" aria-label="Anterior">
          <Icon name="prev" />
        </button>
        <button onClick={() => { unlockAudio(); setPaused((p) => !p); }} className="grid h-16 w-16 place-items-center rounded-full bg-accent" aria-label={paused ? 'Continuar' : 'Pausa'}>
          <Icon name={paused ? 'play' : 'pause'} className="h-6 w-6" />
        </button>
        <button onClick={() => go(1)} className="grid h-12 w-12 place-items-center rounded-full bg-white/10" aria-label="Siguiente">
          <Icon name="next" />
        </button>
      </div>
    </div>
  );
}
