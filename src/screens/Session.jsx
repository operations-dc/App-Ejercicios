import { useEffect, useMemo, useRef, useState } from 'react';
import ExerciseDemo from '../components/ExerciseDemo.jsx';
import { Icon, ScreenDialog } from '../components/ui.jsx';
import { EXERCISES } from '../data/exercises.js';
import { LINES } from '../data/speech-en.js';
import { codigo } from '../data/military.js';
import { buildSteps, totalSecs } from '../lib/session.js';
import { beep, cancelSpeech, keepAwake, onDuck, say, setAudioSession, unlockAudio, vibrate } from '../lib/audio.js';
import { music } from '../lib/music.js';
import { MUSICA } from '../lib/storage.js';
import { pad2 } from './Home.jsx';

const ORDEN_MUSICA = ['app', 'propia', 'off'];
const CORTO = { Calentamiento: 'Calent.', 'Vuelta a la calma': 'Calma', 'Prepárate': 'Prep.' };

// Intensidad de la música según el paso.
function nivelMusica(step) {
  if (step.kind === 'prep') return 'warm';
  if (step.kind === 'rest') return 'rest';
  if (step.fase === 'Circuito') return 'work';
  if (step.fase === 'Calentamiento') return 'warm';
  return 'calm';
}

// Sesión / HUD (EX-006). Duraciones y orden de pasos: los de lib/session.js, sin cambios.
// Efectos (voz, pitidos, vibración, redoble) solo desde efectos/intervalos, nunca desde
// actualizadores de estado: en StrictMode estos se ejecutan dos veces.
export default function Session({ workout, ajustes, onAjustes, onExit, onFinish }) {
  const steps = useMemo(() => buildSteps(workout), [workout]);
  const total = useMemo(() => totalSecs(steps), [steps]);
  const [idx, setIdx] = useState(0);
  const [left, setLeftState] = useState(steps[0].secs);
  const [paused, setPaused] = useState(false);
  const voz = ajustes.voz;
  const musica = ajustes.musica;
  const [aviso, setAviso] = useState(null);
  const startedAt = useRef(Date.now());
  const lastTick = useRef(null);
  const leftRef = useRef(steps[0].secs);
  const vozRef = useRef(voz);
  const pausedRef = useRef(paused);
  const announced = useRef(-1); // último paso anunciado (evita repetir en StrictMode/pausa)
  const advanced = useRef(-1); // último paso ya cerrado (evita doble avance)
  const finishing = useRef(false);
  const mounted = useRef(false);
  vozRef.current = voz;
  pausedRef.current = paused;
  const step = steps[idx];
  const ex = EXERCISES[step.exId];

  const setLeft = (v) => {
    leftRef.current = v;
    setLeftState(v);
  };

  // Nuevo paso: reinicia el tiempo restante.
  useEffect(() => {
    setLeft(steps[idx].secs);
    advanced.current = -1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // Anuncio de cada paso, una sola vez y nunca en pausa (al reanudar se anuncia el
  // paso vigente si se navegó mientras estaba en pausa). Voz siempre en inglés.
  useEffect(() => {
    if (paused || announced.current === idx) return;
    announced.current = idx;
    const s = steps[idx];
    if (s.kind === 'prep') say(LINES.prep(s.exId), vozRef.current);
    else if (s.kind === 'rest') say(LINES.rest(s.exId), vozRef.current);
    else {
      say(LINES.work(s.exId, s.secs), vozRef.current);
      vibrate(200);
    }
  }, [idx, paused, steps]);

  useEffect(() => {
    mounted.current = true;
    unlockAudio();
    keepAwake(true);
    const onVis = () => document.visibilityState === 'visible' && mounted.current && keepAwake(true);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      mounted.current = false;
      keepAwake(false);
      document.removeEventListener('visibilitychange', onVis);
      music.stop(finishing.current ? 1.5 : 0.3);
      onDuck(null);
      // La limpieza de StrictMode (montaje→limpieza→montaje) es síncrona: solo se corta la
      // voz si de verdad se ha desmontado, y nunca la frase final de misión cumplida.
      queueMicrotask(() => {
        if (!mounted.current && !finishing.current) cancelSpeech();
      });
    };
  }, []);

  // Música: la de la app, la tuya (mezclada) o ninguna.
  useEffect(() => {
    setAudioSession(musica === 'propia' ? 'ambient' : 'playback');
    onDuck(musica === 'app' ? (d) => music.duck(d) : null);
    if (musica === 'app' && !paused) music.start({ dia: workout.dia, bpm: workout.suave ? 112 : 124 });
    else music.stop();
  }, [musica, paused, workout]);

  useEffect(() => {
    music.setLevel(nivelMusica(step));
  }, [step]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 1600);
    return () => clearTimeout(t);
  }, [aviso]);

  const cambiarMusica = () => {
    unlockAudio();
    const sig = ORDEN_MUSICA[(ORDEN_MUSICA.indexOf(musica) + 1) % ORDEN_MUSICA.length];
    onAjustes({ musica: sig });
    setAviso(MUSICA[sig]);
  };

  const cambiarVoz = () => {
    if (voz) cancelSpeech(); // apagar la voz corta la frase en curso
    onAjustes({ voz: !voz });
    setAviso(voz ? 'Voz desactivada' : 'Voz activada');
  };

  const togglePausa = () => {
    unlockAudio();
    if (!paused) cancelSpeech(); // la pausa silencia también la locución vigente
    setPaused((p) => !p);
  };

  // Temporizador basado en reloj real (no se desfasa si el navegador ralentiza el intervalo).
  useEffect(() => {
    if (paused) return;
    lastTick.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      const l = leftRef.current;
      const nl = l - dt;
      const s = steps[idx];
      // Pitidos 3-2-1, redoble antes de trabajo y cambio de lado a mitad (una vez cada uno).
      for (const mark of [3, 2, 1]) if (l > mark && nl <= mark) beep(mark === 1 ? 660 : 520);
      if (s.kind !== 'work' && steps[idx + 1]?.kind === 'work' && l > 2 && nl <= 2) music.roll();
      if (s.kind === 'work' && EXERCISES[s.exId].lados && l > s.secs / 2 && nl <= s.secs / 2) {
        say(LINES.side(), vozRef.current);
        vibrate([100, 80, 100]);
      }
      setLeft(nl);
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, idx, steps]);

  // Fin de paso / fin de sesión (una sola vez por paso).
  useEffect(() => {
    // leftRef: el reinicio del paso nuevo es síncrono; el estado `left` puede ir un render atrás.
    if (left > 0 || leftRef.current > 0 || advanced.current === idx) return;
    advanced.current = idx;
    if (idx < steps.length - 1) {
      beep(990, 0.2);
      setIdx((i) => i + 1);
    } else {
      finishing.current = true;
      beep(990, 0.4);
      music.stop(1.5);
      say(LINES.done(), vozRef.current);
      onFinish(Math.round((Date.now() - startedAt.current) / 1000));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const go = (d) => {
    const n = Math.min(steps.length - 1, Math.max(0, idx + d));
    if (n === idx) return;
    if (pausedRef.current) cancelSpeech();
    setIdx(n);
  };
  const salir = () => {
    if (window.confirm('¿Salir del entrenamiento? No se guardará el progreso de hoy.')) onExit();
  };

  const elapsed = steps.slice(0, idx).reduce((s, x) => s + x.secs, 0) + (step.secs - Math.max(0, left));
  const secs = Math.max(0, Math.ceil(left));
  const isWork = step.kind === 'work';
  const sig = steps[idx + 1];
  const lit = Math.max(0, Math.min(30, Math.ceil((Math.max(0, left) / step.secs) * 30)));
  const estado = paused ? 'Pausa' : isWork ? 'Trabajo' : step.kind === 'rest' ? 'Descanso' : 'Prepárate';

  // Bloques reales del plan (calentamiento / circuito / calma) con su progreso.
  const bloques = useMemo(() => {
    const out = [];
    steps.forEach((s, i) => {
      let b = out[out.length - 1];
      if (!b || b.fase !== s.fase) out.push((b = { fase: s.fase, start: i, secs: 0, offset: 0 }));
      b.secs += s.secs;
    });
    let acc = 0;
    for (const b of out) {
      b.offset = acc;
      acc += b.secs;
    }
    return out;
  }, [steps]);

  return (
    <ScreenDialog
      label={`Sesión misión ${workout.dia}`}
      onEscape={salir}
      className={`hud ${paused ? 'paused' : ''} ${isWork ? '' : 'rest'}`}
      data-screen="session"
      data-step-kind={step.kind}
      data-step-idx={idx}
      data-ex={step.exId}
      data-paused={paused ? 'true' : 'false'}
    >
      <div className="topbar">
        <button onClick={salir} className="o28-iconbtn" aria-label="Salir a base">
          <Icon name="close" />
        </button>
        <div className="t">
          <div className="kicker b">Misión {pad2(workout.dia)}</div>
          <strong>{codigo(workout)}</strong>
        </div>
        <button onClick={cambiarMusica} className="o28-iconbtn" aria-pressed={musica !== 'off'} aria-label={`Música: ${MUSICA[musica]}. Cambiar`}>
          <Icon name={musica === 'propia' ? 'headphones' : musica === 'off' ? 'music-off' : 'music'} />
        </button>
        <button onClick={cambiarVoz} className="o28-iconbtn" aria-pressed={voz} aria-label={voz ? 'Voz activada (inglés). Desactivar' : 'Voz desactivada. Activar'}>
          <Icon name={voz ? 'sound' : 'mute'} />
        </button>
      </div>

      <div
        className="phasebar"
        style={{ gridTemplateColumns: bloques.map((b) => `${b.secs}fr`).join(' ') }}
        role="progressbar"
        aria-label="Progreso de la sesión por bloques"
        aria-valuemin={0}
        aria-valuemax={Math.round(total)}
        aria-valuenow={Math.round(elapsed)}
        aria-valuetext={`Paso ${idx + 1} de ${steps.length}`}
      >
        {bloques.map((b) => {
          const p = Math.max(0, Math.min(1, (elapsed - b.offset) / b.secs));
          return (
            <div key={b.fase + b.start} className={step.fase === b.fase ? 'cur' : ''}>
              <div className="bar"><i style={{ width: `${p * 100}%` }} /></div>
              <span>{CORTO[b.fase] || b.fase}</span>
            </div>
          );
        })}
      </div>

      <div className="hud-order">
        <div style={{ minWidth: 0 }}>
          <div className="kicker b">{step.kind === 'rest' ? 'Descanso · siguiente' : step.kind === 'prep' ? 'Prepárate · siguiente' : 'Orden actual · Trabajo'}</div>
          <h1>{ex.nombre}</h1>
        </div>
        {step.rondas > 1 && (
          <div className="rnd"><div className="kicker">Ronda</div><b className="tnum">{step.ronda}/{step.rondas}</b></div>
        )}
      </div>

      <div className="figbay">
        <div className="hd"><span className="code">Demostración · {ex.nombre}</span><span className="code">{paused ? 'Detenida' : 'En curso'}</span></div>
        <div className="fig-wrap">
          <ExerciseDemo exId={step.exId} dark playing={!paused} className="h-full w-full" />
        </div>
      </div>

      {aviso && <div role="status" className="hud-toast">{aviso}</div>}

      <div className="instrument">
        <div className="read">
          <div className="kicker">Restante</div>
          <div className="digits tnum" role="timer" aria-label={`${secs} segundos restantes`}>{secs}<small>S</small></div>
          {paused && <div className="paused-band" role="status">En pausa</div>}
        </div>
        <div className="side">
          <div><span className="kicker">Bloque</span><b>{CORTO[step.fase] || step.fase}</b></div>
          <div><span className="kicker">Estado</span><b className="mode" data-estado={estado}>{estado}</b></div>
        </div>
      </div>
      <div className="ticks30" aria-hidden="true">
        {Array.from({ length: 30 }, (_, i) => <i key={i} className={i < lit ? 'on' : ''} />)}
      </div>

      <div className="manual" aria-label="Manual técnico">
        <ul>{ex.tips.slice(0, 2).map((t) => <li key={t}>{t}</li>)}</ul>
        {ex.facil && <p className="easy">Más fácil: {ex.facil}</p>}
      </div>

      {sig && (
        <div className="nextorder">
          <span className="kicker">Próxima orden</span>
          <b>{EXERCISES[sig.exId].nombre}</b>
        </div>
      )}

      <div className="controls">
        <button className="ctl" onClick={() => go(-1)} disabled={idx === 0} aria-label="Anterior">
          <Icon name="prev" />Anterior
        </button>
        <button className="ctl main" onClick={togglePausa} aria-label={paused ? 'Continuar' : 'Pausa'} data-action="pause">
          <Icon name={paused ? 'play' : 'pause'} /><span>{paused ? 'Continuar' : 'Pausa'}</span>
        </button>
        <button className="ctl" onClick={() => go(1)} disabled={idx === steps.length - 1} aria-label="Siguiente">
          <Icon name="next" />Siguiente
        </button>
      </div>
    </ScreenDialog>
  );
}
