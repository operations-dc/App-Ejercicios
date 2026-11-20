import ExerciseDemo from '../components/ExerciseDemo.jsx';
import { ScreenDialog } from '../components/ui.jsx';
import { EXERCISES } from '../data/exercises.js';
import { workoutFor } from '../data/plan.js';
import { codigo } from '../data/military.js';
import { hasVideo } from '../data/media.js';
import { MUSICA_CORTO } from '../lib/storage.js';
import { pad2 } from './Home.jsx';

const MUSICA_SEG = { app: 'App', propia: 'Propia', off: 'Sin música' };

// Briefing de misión (EX-006): pantalla completa con datos reales del entrenamiento del día.
export default function DaySheet({ dia, ciclo, hecho, ajustes, onAjustes, onClose, onStart }) {
  const w = workoutFor(dia, ciclo);
  return (
    <ScreenDialog label={`Briefing misión ${dia}`} onEscape={onClose} data-screen="briefing">
      <div className="topbar">
        <button className="o28-iconbtn" onClick={onClose} aria-label="Volver a base">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="t"><div className="kicker b">Briefing</div><strong>Misión {pad2(dia)} · Fase {pad2(w.semana)}</strong></div>
        {hecho && <span className="tag">Cumplida</span>}
      </div>

      <div className="o28-scroll">
        <div className="brief-hero">
          <span className="n tnum" aria-hidden="true">{pad2(dia)}</span>
          <div>
            <div className="kicker">Día {dia} · Semana {w.semana}</div>
            <h1><span className="sr-only">Misión {dia}: </span>{codigo(w)}</h1>
            <p>{w.titulo}</p>
          </div>
        </div>

        <div className="figplate ticks">
          <div className="hd"><span className="kicker">Ejercicio principal</span><span className="code">{EXERCISES[w.principal].nombre}</span></div>
          <div className="fig-wrap"><ExerciseDemo exId={w.principal} playing={false} dark className="h-full w-full" /></div>
        </div>

        <div className="spec3 tnum">
          <div><div className="k">Duración</div><div className="v">{w.minutos} min</div></div>
          <div><div className="k">Material</div><div className="v">Ninguno</div></div>
          <div><div className="k">Nivel</div><div className="v">{w.nivel}{w.suave ? ' · Suave' : ''}</div></div>
        </div>

        <div className="sect-head"><h2>Orden de operaciones</h2><span className="code">{w.fases.length} bloques</span></div>
        <div>
          {w.fases.map((f, fi) => (
            <section className="op" key={f.nombre + fi}>
              <span className="i" aria-hidden="true">{fi + 1}</span>
              <div>
                <h3>
                  {f.nombre}
                  <span>
                    {f.rondas > 1 ? `${f.rondas} rondas` : '1 ronda'} · {f.trabajo} s por ejercicio · {f.descanso ? `${f.descanso} s descanso` : 'sin descanso'}
                  </span>
                </h3>
                <ol>
                  {f.ejercicios.map((id, i) => (
                    <li className="exrow" key={id + i}>
                      <b>{EXERCISES[id].nombre}</b>
                      {hasVideo(id) && <span className="tag">Vídeo</span>}
                      <em>{f.trabajo} s</em>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          ))}
        </div>

        <div className="sect-head"><h2>Música</h2><span className="code">{MUSICA_CORTO[ajustes.musica]}</span></div>
        <div className="seg3" role="group" aria-label="Música durante la sesión">
          {Object.keys(MUSICA_SEG).map((k) => (
            <button key={k} aria-pressed={ajustes.musica === k} onClick={() => onAjustes({ musica: k })}>
              {MUSICA_SEG[k]}
            </button>
          ))}
        </div>
        {ajustes.musica === 'propia' && (
          <p className="hint">Pon tu playlist en Spotify o Apple Music antes de empezar: la voz (en inglés) y los pitidos sonarán por encima.</p>
        )}
      </div>

      <div className="dock">
        <button className="btn btn-primary" onClick={() => onStart(w)} data-action="start-mission">
          <span>{hecho ? 'Repetir' : 'Iniciar'} misión {pad2(dia)}</span>
          <span className="chev" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>
        </button>
      </div>
    </ScreenDialog>
  );
}
