import { useState } from 'react';
import { ScreenDialog } from '../components/ui.jsx';
import { codigo } from '../data/military.js';
import { today } from '../lib/storage.js';
import { pad2 } from './Home.jsx';

const SENSACIONES = [
  { id: 'facil', label: 'Fácil' },
  { id: 'bien', label: 'Bien' },
  { id: 'duro', label: 'Duro' },
];

// Parte de misión: datos reales de la sesión recién terminada. Guardar usa el flujo existente.
// Sin Escape: el parte solo se cierra guardándolo (no se pierde la sesión cumplida).
export default function Done({ workout, duracionSeg, onSave }) {
  const [sens, setSens] = useState(null);
  const min = Math.max(1, Math.round(duracionSeg / 60));
  return (
    <ScreenDialog label="Misión cumplida" data-screen="done">
      <div className="o28-scroll">
        <div className="svc-head">
          <div className="code">Parte de misión · {today()}</div>
          <h1>Misión cumplida</h1>
          <p>Registra cómo te ha ido y guarda el parte.</p>
        </div>

        <div className="brief-hero">
          <span className="n tnum" aria-hidden="true">{pad2(workout.dia)}</span>
          <div>
            <div className="kicker">Misión {workout.dia} · Nivel {workout.ciclo}</div>
            <h2 style={{ fontSize: 30, lineHeight: 1, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>{codigo(workout)}</h2>
            <p>{workout.titulo}</p>
          </div>
        </div>

        <div className="stat-row tnum" style={{ marginTop: 14 }}>
          <div><b>{min}</b><span>Minutos</span></div>
          <div><b>{workout.nivel}</b><span>Nivel</span></div>
          <div><b>{pad2(workout.dia)}</b><span>Misión</span></div>
        </div>

        <div className="sect-head"><h2 id="h-sens">Sensación</h2><span className="code">Opcional</span></div>
        <div className="seg3" role="group" aria-labelledby="h-sens">
          {SENSACIONES.map((s) => (
            <button key={s.id} aria-pressed={sens === s.id} onClick={() => setSens(s.id)}>{s.label}</button>
          ))}
        </div>
      </div>
      <div className="dock">
        <button className="btn btn-primary" onClick={() => onSave(sens)} data-action="save-report">
          <span>Guardar parte</span>
          <span className="chev" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
        </button>
      </div>
    </ScreenDialog>
  );
}
